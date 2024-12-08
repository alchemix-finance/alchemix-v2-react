import { transmuterV2Abi } from "@/abi/transmuterV2";
import { CtaButton } from "@/components/common/CtaButton";
import { TransmuterInput } from "@/components/common/input/TransmuterInput";
import { useAllowance } from "@/hooks/useAllowance";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { QueryKeys, ScopeKeys } from "@/lib/queries/queriesSchema";
import { Token, Transmuter } from "@/lib/types";
import { invalidateWagmiUseQueryPredicate } from "@/utils/helpers/invalidateWagmiUseQueryPredicate";
import { isInputZero } from "@/utils/inputNotZero";
import { formatNumber } from "@/utils/number";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatUnits, parseEther } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { TransmuterAprDuneQueryResponse } from "./TransmuterApr";
import { ONE_DAY_IN_MS } from "@/lib/constants";

export const Deposit = ({
  transmuter,
  syntheticToken,
}: {
  transmuter: Transmuter;
  syntheticToken: Token;
}) => {
  const chain = useChain();
  const queryClient = useQueryClient();
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  const [depositAmount, setDepositAmount] = useState("");

  const {
    isApprovalNeeded,
    approve,
    approveConfig,
    isPending: isPendingAllowance,
    isFetching: isFetchingAllowance,
  } = useAllowance({
    tokenAddress: syntheticToken.address,
    spender: transmuter.address,
    amount: depositAmount,
    decimals: syntheticToken.decimals,
  });

  const {
    data: depositConfig,
    isPending: isPendingDepositConfig,
    error: depositConfigError,
  } = useSimulateContract({
    address: transmuter.address,
    abi: transmuterV2Abi,
    chainId: chain.id,
    functionName: "deposit",
    args: [parseEther(depositAmount), address!],
    query: {
      enabled:
        !!address && !isInputZero(depositAmount) && isApprovalNeeded === false,
    },
  });

  const { writeContract: deposit, data: depositHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Deposit into transmuter",
    }),
  });

  const { data: depositReceipt } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  useEffect(() => {
    if (depositReceipt) {
      setDepositAmount("");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Transmuters] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQueryPredicate({
            query,
            scopeKey: ScopeKeys.TransmuterInput,
          }),
      });
    }
  }, [depositReceipt, queryClient]);

  const DUNE_API_ENDPOINT = "https://api.dune.com/api/v1/query";
  const API_KEY = import.meta.env.VITE_DUNE_API_KEY;

  const {
    data,
    isError: aprQueryError,
    isPending: aprQueryPending,
  } = useQuery({
    queryKey: [
      QueryKeys.TransmuterApr,
      transmuter.address,
      transmuter.metadata.aprQueryUri,
      DUNE_API_ENDPOINT,
      API_KEY,
      transmuter?.totalUnexchanged || BigInt(0),
      depositAmount,
    ],
    queryFn: async () => {
      const response = await fetch(
        `${DUNE_API_ENDPOINT}/${transmuter.metadata.aprQueryUri}/results?api_key=${API_KEY}`,
      );
      const data = (await response.json()) as TransmuterAprDuneQueryResponse;

      const apr = data.result.rows[0].projected_yield_rate;

      if (apr === undefined) {
        throw new Error("APR fetch failed.");
      }

      // proj apr estimated roughly based on the previously fetched apr by checking the ratio of current assets to new assets and currentApr
      // to newApr, based on user input of alAssets to add as a deposit.
      // projectedApr / apr = assetsCurrentlyDeposited / (assetsCurrentlyDeposited + assetsToDeposit)
      // projectedApr = apr * (assetsCurrentlyDeposited / (assetsCurrentlyDeposited + assetsToDeposit))
      const formattedTotalAssetsDeposited = Number(
        formatUnits(transmuter?.totalUnexchanged || BigInt(0), 18),
      );
      const assetsToDeposit = Number(depositAmount || 0);
      const projectedApr =
        apr *
        (formattedTotalAssetsDeposited /
          (formattedTotalAssetsDeposited + assetsToDeposit));

      return {
        projectedApr,
      };
    },
    enabled: !!transmuter.metadata.aprQueryUri,
    staleTime: ONE_DAY_IN_MS,
    retry: false,
  });

  const onCtaClick = () => {
    if (isApprovalNeeded === true) {
      approveConfig && approve(approveConfig.request);
      return;
    }

    if (depositConfigError) {
      toast.error("Deposit failed", {
        description:
          depositConfigError.name === "ContractFunctionExecutionError"
            ? depositConfigError.cause.message
            : depositConfigError.message,
      });
      return;
    }

    if (depositConfig) {
      deposit(depositConfig.request);
    } else {
      toast.error("Deposit failed", {
        description: "Unkown error. Please contact Alchemix team.",
      });
    }
  };

  const isPending =
    isApprovalNeeded === false
      ? isPendingDepositConfig
      : isPendingAllowance || isFetchingAllowance;

  return (
    <>
      <TransmuterInput
        amount={depositAmount}
        setAmount={setDepositAmount}
        tokenAddress={syntheticToken.address}
        tokenSymbol={syntheticToken.symbol}
        tokenDecimals={syntheticToken.decimals}
        type="Balance"
        transmuterAddress={transmuter.address}
      />

      <p className="text-xs font-light text-lightgrey10 lg:text-sm">
        {aprQueryError || !transmuter.metadata.aprQueryUri
          ? "Projected APR: N/A"
          : aprQueryPending
            ? "calculating projected APR..."
            : `Projected APR: ${formatNumber(`${data.projectedApr}`, { allowNegative: false })}%`}
      </p>

      <CtaButton
        variant="outline"
        onClick={onCtaClick}
        disabled={isPending || isInputZero(depositAmount)}
      >
        {isApprovalNeeded ? "Approve" : "Deposit"}
      </CtaButton>
    </>
  );
};
