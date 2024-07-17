import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { calculateMinimumOut } from "@/utils/helpers/minAmountWithSlippage";
import { useVaults } from "@/lib/queries/useVaults";
import { isInputZero } from "@/utils/inputNotZero";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { LiquidateTokenInput } from "@/components/common/input/LiquidateInput";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";

export const Liquidate = () => {
  const queryClient = useQueryClient();
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("2");

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
      liquidationToken?.address ?? zeroAddress,
      parseUnits(amount, liquidationToken?.decimals ?? 18),
    ],
    query: {
      enabled: !!liquidationToken && !isInputZero(amount),
    },
  });

  const minimumOut = calculateMinimumOut(shares, parseUnits(slippage, 6));

  const {
    data: liquidateConfig,
    isFetching,
    error: liquidateError,
  } = useSimulateContract({
    address: ALCHEMISTS_METADATA[chain.id][selectedSynthAsset],
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "liquidate",
    args: [liquidationToken?.address ?? zeroAddress, shares ?? 0n, minimumOut],
    query: {
      enabled:
        !isInputZero(amount) && !!liquidationToken && shares !== undefined,
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
  };

  const handleLiquidationTokenSelect = (value: string) => {
    setAmount("");
    setLiquidationTokenAddress(value as `0x${string}` | undefined);
  };

  const onCtaClick = useCallback(() => {
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
  }, [liquidate, liquidateConfig, liquidateError]);

  return (
    <div className="space-y-2">
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
          <div className="flex items-center gap-2">
            <p>Repayment token:</p>
            <Select
              value={liquidationTokenAddress}
              onValueChange={handleLiquidationTokenSelect}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Repayment Token">
                  {liquidationToken.symbol}
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
          </div>
          <LiquidateTokenInput
            amount={amount}
            setAmount={setAmount}
            vault={vault}
            tokenSymbol={liquidationToken.symbol}
          />
          <div className="flex items-center">
            <p>Slippage</p>
            <Input
              type="number"
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={onCtaClick}
            disabled={isFetching || isInputZero(amount)}
          >
            {isFetching ? "Preparing..." : "Liquidate"}
          </Button>
        </>
      )}
    </div>
  );
};
