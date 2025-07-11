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
  useAccount,
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
import { useAlchemists } from "@/lib/queries/useAlchemists";
import { useAllowance } from "@/hooks/useAllowance";
import { DebtSelection } from "@/components/vaults/common_actions/DebtSelection";
import { isInputZero } from "@/utils/inputNotZero";
import { QueryKeys, ScopeKeys } from "@/lib/queries/queriesSchema";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { RepayInput } from "@/components/common/input/RepayInput";
import { invalidateWagmiUseQueryPredicate } from "@/utils/helpers/invalidateWagmiUseQueryPredicate";
import { CtaButton } from "@/components/common/CtaButton";
import { getTokenLogoUrl } from "@/utils/getTokenLogoUrl";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";

export const Repay = () => {
  const queryClient = useQueryClient();
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  const [amount, setAmount] = useState("");

  const { data: alchemists } = useAlchemists();
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

  const avaiableRepaymentTokens = useMemo(() => {
    const alchemist = alchemists?.find(
      (alchemist) => alchemist.synthType === selectedSynthAsset,
    );
    return tokens?.filter(
      (token) =>
        token.address === alchemist?.debtToken ||
        alchemist?.underlyingTokensAddresses.includes(token.address),
    );
  }, [alchemists, selectedSynthAsset, tokens]);

  const [repaymentTokenAddress, setRepaymentTokenAddress] = useState(
    avaiableRepaymentTokens?.[0]?.address,
  );

  const repaymentToken = tokens?.find(
    (token) => token.address === repaymentTokenAddress,
  );

  const {
    isApprovalNeeded,
    approve,
    approveConfig,
    approveUsdtEthConfig,
    isPending: isPendingAllowance,
    isFetching: isFetchingAllowance,
  } = useAllowance({
    tokenAddress: repaymentToken?.address,
    spender: ALCHEMISTS_METADATA[chain.id][selectedSynthAsset],
    amount,
    decimals: repaymentToken?.decimals,
  });

  const {
    data: burnConfig,
    isPending: isPendingBurnConfig,
    error: burnConfigError,
  } = useSimulateContract({
    address: ALCHEMISTS_METADATA[chain.id][selectedSynthAsset],
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "burn",
    args: [parseUnits(amount, repaymentToken?.decimals ?? 18), address!],
    query: {
      enabled:
        !isInputZero(amount) &&
        !!address &&
        !!repaymentToken &&
        isApprovalNeeded === false &&
        repaymentToken.symbol.toLowerCase() ===
          selectedSynthAsset.toLowerCase(),
    },
  });

  const {
    data: repayConfig,
    isPending: isPendingRepayConfig,
    error: repayConfigError,
  } = useSimulateContract({
    address: ALCHEMISTS_METADATA[chain.id][selectedSynthAsset],
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "repay",
    args: [
      repaymentToken!.address,
      parseUnits(amount, repaymentToken?.decimals ?? 18),
      address!,
    ],
    query: {
      enabled:
        !isInputZero(amount) &&
        !!address &&
        !!repaymentToken &&
        isApprovalNeeded === false &&
        repaymentToken.symbol.toLowerCase() !==
          selectedSynthAsset.toLowerCase(),
    },
  });

  const { writeContract: repay, data: repayTxHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Repay",
    }),
  });

  const { data: repayReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: repayTxHash,
  });

  useEffect(() => {
    if (repayReceipt) {
      setAmount("");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Alchemists] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Vaults] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQueryPredicate({
            query,
            scopeKey: ScopeKeys.RepayInput,
          }),
      });
    }
  }, [repayReceipt, queryClient]);

  const handleSynthAssetChange = (value: string) => {
    const newSynthAsset = value as SynthAsset;
    const alchemist = alchemists?.find(
      (alchemist) => alchemist.synthType === newSynthAsset,
    );
    const newRepaymentTokenAddress = tokens?.filter(
      (token) =>
        token.address === alchemist?.debtToken ||
        alchemist?.underlyingTokensAddresses.includes(token.address),
    )[0].address;
    setRepaymentTokenAddress(newRepaymentTokenAddress);
    setSelectedSynthAsset(newSynthAsset);
  };

  const onCtaClick = () => {
    if (isApprovalNeeded) {
      if (approveUsdtEthConfig?.request) {
        approve(approveUsdtEthConfig.request);
        return;
      }
      approveConfig?.request && approve(approveConfig.request);
      return;
    }

    if (
      repaymentToken?.symbol.toLowerCase() !== selectedSynthAsset.toLowerCase()
    ) {
      if (repayConfigError) {
        toast.error("Repay failed", {
          description: getToastErrorMessage({
            error: repayConfigError,
          }),
        });
        return;
      }
      if (repayConfig) {
        repay(repayConfig.request);
      } else {
        toast.error("Repay failed", {
          description:
            "Repay failed. Unknown error. Please contact Alchemix team.",
        });
      }
      return;
    }

    if (burnConfigError) {
      toast.error("Repay failed", {
        description: getToastErrorMessage({ error: burnConfigError }),
      });
      return;
    }
    if (burnConfig) {
      repay(burnConfig.request);
    } else {
      toast.error("Repay failed", {
        description:
          "Repay failed. Unknown error. Please contact Alchemix team.",
      });
    }
  };

  const isPending =
    isApprovalNeeded === false
      ? repaymentToken?.symbol.toLowerCase() ===
        selectedSynthAsset.toLowerCase()
        ? isPendingBurnConfig
        : isPendingRepayConfig
      : isPendingAllowance || isFetchingAllowance;

  return (
    <div className="bg-grey15inverse dark:bg-grey15 space-y-4 p-4">
      <DebtSelection
        selectedSynthAsset={selectedSynthAsset}
        availableSynthAssets={availableSynthAssets}
        handleSynthAssetChange={handleSynthAssetChange}
      />
      {(!avaiableRepaymentTokens || !repaymentToken) && <p>Loading...</p>}
      {!!avaiableRepaymentTokens && !!repaymentToken && (
        <>
          <div className="border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3 flex rounded-sm border">
            <Select
              value={repaymentTokenAddress}
              onValueChange={(value) =>
                setRepaymentTokenAddress(value as `0x${string}`)
              }
            >
              <SelectTrigger className="h-auto w-24 sm:w-56">
                <SelectValue placeholder="Repayment Token" asChild>
                  <div className="flex items-center gap-4">
                    <img
                      src={getTokenLogoUrl(repaymentToken.symbol)}
                      alt={repaymentToken.symbol}
                      className="h-12 w-12"
                    />
                    <span className="hidden text-xl sm:inline">
                      {repaymentToken.symbol}
                    </span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {avaiableRepaymentTokens &&
                  avaiableRepaymentTokens.map((token) => (
                    <SelectItem key={token.address} value={token.address}>
                      {token.symbol}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <RepayInput
              amount={amount}
              setAmount={setAmount}
              repaymentToken={repaymentToken}
              alchemistAddress={
                ALCHEMISTS_METADATA[chain.id][selectedSynthAsset]
              }
              isSelectedSynthAsset={
                repaymentToken.symbol.toLowerCase() ===
                selectedSynthAsset.toLowerCase()
              }
            />
          </div>
          <CtaButton
            variant="outline"
            width="full"
            onClick={onCtaClick}
            disabled={isPending || isInputZero(amount)}
          >
            {isApprovalNeeded
              ? "Approve"
              : `Repay with ${repaymentToken.symbol}`}
          </CtaButton>
        </>
      )}
    </div>
  );
};
