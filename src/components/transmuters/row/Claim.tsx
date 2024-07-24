import { transmuterV2Abi } from "@/abi/transmuterV2";
import { TransmuterInput } from "@/components/common/input/TransmuterInput";
import { Button } from "@/components/ui/button";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Token, Transmuter } from "@/lib/types";
import { isInputZero } from "@/utils/inputNotZero";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export const Claim = ({
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

  const [amount, setAmount] = useState("");

  const {
    data: claimConfig,
    isFetching,
    error: claimConfigError,
  } = useSimulateContract({
    address: transmuter.address,
    abi: transmuterV2Abi,
    chainId: chain.id,
    functionName: "claim",
    args: [parseEther(amount), address!],
    query: {
      enabled: !!address && !isInputZero(amount),
    },
  });

  const { writeContract: claim, data: claimHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Claim from transmuter",
    }),
  });

  const { data: claimReceipt } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  useEffect(() => {
    if (claimReceipt) {
      setAmount("");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Transmuters] });
    }
  }, [claimReceipt, queryClient]);

  const onCtaClick = useCallback(() => {
    if (claimConfigError) {
      toast.error("Claim failed", {
        description:
          claimConfigError.name === "ContractFunctionExecutionError"
            ? claimConfigError.cause.message
            : claimConfigError.message,
      });
      return;
    }
    if (claimConfig) {
      claim(claimConfig.request);
    } else {
      toast.error("Claim failed", {
        description: "Unknown error occurred. Please contact Alchemix team.",
      });
    }
  }, [claim, claimConfig, claimConfigError]);

  return (
    <>
      <TransmuterInput
        amount={amount}
        setAmount={setAmount}
        transmuterAddress={transmuter.address}
        tokenSymbol={syntheticToken.symbol}
        type="Claimable"
        tokenAddress={syntheticToken.address}
        tokenDecimals={syntheticToken.decimals}
      />

      <Button
        variant="outline"
        onClick={onCtaClick}
        disabled={isFetching || isInputZero(amount)}
      >
        Claim
      </Button>
    </>
  );
};
