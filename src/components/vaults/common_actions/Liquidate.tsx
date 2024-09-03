import { useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import {
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { parseUnits, zeroAddress } from "viem";
import { toast } from "sonner";
import { useChain } from "@/hooks/useChain";
import { useQueryClient } from "@tanstack/react-query";
import { SynthAsset } from "@/lib/config/synths";
import { ALCHEMISTS_METADATA } from "@/lib/config/alchemists";
import { DebtSelection } from "@/components/vaults/common_actions/DebtSelection";
import { calculateMinimumOut } from "@/utils/helpers/minAmountWithSlippage";
import { useVaults } from "@/lib/queries/useVaults";
import { isInputZero } from "@/utils/inputNotZero";
import { QueryKeys, ScopeKeys } from "@/lib/queries/queriesSchema";
import { LiquidateTokenInput } from "@/components/common/input/LiquidateInput";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { Switch } from "@/components/ui/switch";
import { SlippageInput } from "@/components/common/input/SlippageInput";
import { MAX_UINT256_BN } from "@/lib/constants";
import { invalidateWagmiUseQuery } from "@/utils/helpers/invalidateWagmiUseQuery";
import { CtaButton } from "@/components/common/CtaButton";

export const Liquidate = () => {
  const queryClient = useQueryClient();
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [confirmedLiquidation, setConfirmedLiquidation] = useState(false);

  const { data: vaults } = useVaults();
  const { data: tokens } = useTokensQuery();

  const availableSynthAssets = useMemo(() => {
    return Object.entries(ALCHEMISTS_METADATA[chain.id])
      .map(([synthAsset, alchemist]) => {
        if (alchemist !== zeroAddress) {
          return synthAsset;
        }
      })
      .filter(Boolean) as SynthAsset[];
  }, [chain.id]);

  const [selectedSynthAsset, setSelectedSynthAsset] = useState<SynthAsset>(
    availableSynthAssets[0],
  );

  const avaiableLiquidationTokens = useMemo(() => {
    const filteredVaults = vaults?.filter(
      (v) =>
        v.alchemist.address.toLowerCase() ===
          ALCHEMISTS_METADATA[chain.id][selectedSynthAsset].toLowerCase() &&
        v.position.shares > 0n,
    );
    const tokenAddresses = filteredVaults?.map((v) =>
      v.metadata.yieldTokenOverride
        ? v.metadata.yieldTokenOverride
        : v.yieldToken,
    );
    return tokens?.filter((token) => tokenAddresses?.includes(token.address));
  }, [chain.id, selectedSynthAsset, tokens, vaults]);

  const [liquidationTokenAddress, setLiquidationTokenAddress] = useState(
    avaiableLiquidationTokens?.[0]?.address,
  );

  const liquidationToken = tokens?.find(
    (token) => token.address === liquidationTokenAddress,
  );

  const vault = vaults?.find(
    (v) =>
      v.metadata.yieldTokenOverride?.toLowerCase() ===
        liquidationTokenAddress?.toLowerCase() ||
      v.yieldToken.toLowerCase() === liquidationTokenAddress?.toLowerCase(),
  );

  const { data: shares } = useReadContract({
    address: vault?.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertYieldTokensToShares",
    args: [
      vault?.yieldToken ?? zeroAddress,
      parseUnits(amount, vault?.yieldTokenParams.decimals ?? 18),
    ],
    query: {
      enabled: !!vault && !isInputZero(amount),
    },
  });

  const { data: minimumOut } = useReadContract({
    address: vault?.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertYieldTokensToUnderlying",
    args: [
      vault?.yieldToken ?? zeroAddress,
      parseUnits(amount, vault?.yieldTokenParams.decimals ?? 18),
    ],
    query: {
      enabled: !!vault && !isInputZero(amount),
      select: (sharesInUnderlying) =>
        calculateMinimumOut(sharesInUnderlying, parseUnits(slippage, 2)),
    },
  });

  const {
    data: liquidateConfig,
    isPending,
    error: liquidateError,
  } = useSimulateContract({
    address: ALCHEMISTS_METADATA[chain.id][selectedSynthAsset],
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "liquidate",
    args: [
      vault?.yieldToken ?? zeroAddress,
      shares ?? 0n,
      minimumOut ?? MAX_UINT256_BN,
    ],
    query: {
      enabled:
        !isInputZero(amount) &&
        !!vault &&
        shares !== undefined &&
        minimumOut !== undefined,
    },
  });

  const { writeContract: liquidate, data: liquidateHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Liquidate",
    }),
  });

  const { data: liquidateReceipt } = useWaitForTransactionReceipt({
    hash: liquidateHash,
  });

  useEffect(() => {
    if (liquidateReceipt) {
      setAmount("");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Alchemists] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Vaults] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQuery({
            query,
            scopeKey: ScopeKeys.LiquidateInput,
          }),
      });
    }
  }, [liquidateReceipt, queryClient, chain.id]);

  const handleSynthAssetChange = (value: string) => {
    const newSynthAsset = value as SynthAsset;
    const filteredVaults = vaults?.filter(
      (v) =>
        v.alchemist.address.toLowerCase() ===
          ALCHEMISTS_METADATA[chain.id][newSynthAsset].toLowerCase() &&
        v.position.shares > 0n,
    );
    const newRepaymentTokenAddress = filteredVaults?.map((v) =>
      v.metadata.yieldTokenOverride
        ? v.metadata.yieldTokenOverride
        : v.yieldToken,
    )[0];
    setLiquidationTokenAddress(newRepaymentTokenAddress);
    setSelectedSynthAsset(newSynthAsset);
    setAmount("");
  };

  const handleLiquidationTokenSelect = (value: string) => {
    setAmount("");
    setLiquidationTokenAddress(value as `0x${string}` | undefined);
  };

  const handleConfirmedLiquidationChange = (checked: boolean) => {
    setConfirmedLiquidation(checked);
  };

  const onCtaClick = () => {
    if (liquidateError) {
      toast.error("Liquidate failed", {
        description:
          liquidateError.name === "ContractFunctionExecutionError"
            ? liquidateError.cause.message
            : liquidateError.message,
      });
      return;
    }

    if (liquidateConfig) {
      liquidate(liquidateConfig.request);
    } else {
      toast.error("Liquidate failed", {
        description: "Unknown error. Please contact Alchemix team.",
      });
    }
  };

  return (
    <div className="space-y-4 bg-grey15inverse p-4 dark:bg-grey15">
      <DebtSelection
        selectedSynthAsset={selectedSynthAsset}
        availableSynthAssets={availableSynthAssets}
        handleSynthAssetChange={handleSynthAssetChange}
      />
      {!avaiableLiquidationTokens && <p>Loading...</p>}
      {avaiableLiquidationTokens && avaiableLiquidationTokens.length === 0 && (
        <p>No debt to liquidate</p>
      )}
      {!!avaiableLiquidationTokens && !!liquidationToken && !!vault && (
        <>
          <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
            <Select
              value={liquidationTokenAddress}
              onValueChange={handleLiquidationTokenSelect}
            >
              <SelectTrigger className="h-auto w-24 sm:w-56">
                <SelectValue placeholder="Liquidation Token" asChild>
                  <div className="flex items-center gap-4">
                    <img
                      src={`/images/token-icons/${liquidationToken.symbol}.svg`}
                      alt={liquidationToken.symbol}
                      className="h-12 w-12"
                    />
                    <span className="hidden text-xl sm:inline">
                      {liquidationToken.symbol}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {avaiableLiquidationTokens &&
                  avaiableLiquidationTokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.symbol}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <LiquidateTokenInput
              amount={amount}
              setAmount={setAmount}
              vault={vault}
              tokenSymbol={liquidationToken.symbol}
              tokenDecimals={liquidationToken.decimals}
            />
          </div>
          <SlippageInput slippage={slippage} setSlippage={setSlippage} />
          <div className="flex items-center">
            <Switch
              checked={confirmedLiquidation}
              onCheckedChange={handleConfirmedLiquidationChange}
              id="confirmed-liquidation"
            />
            <label
              className="cursor-pointer pl-2 text-sm text-lightgrey10inverse dark:text-lightgrey10"
              htmlFor="confirmed-liquidation"
            >
              I understand that liquidating will use my deposited collateral to
              repay the outstanding debt
            </label>
          </div>
          <CtaButton
            variant="outline"
            width="full"
            onClick={onCtaClick}
            disabled={isPending || isInputZero(amount) || !confirmedLiquidation}
          >
            {isPending ? "Preparing..." : "Liquidate"}
          </CtaButton>
        </>
      )}
    </div>
  );
};
