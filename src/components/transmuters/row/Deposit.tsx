import { transmuterV2Abi } from "@/abi/transmuterV2";
import { TokenInput } from "@/components/common/input/TokenInput";
import { Button } from "@/components/ui/button";
import { useAllowance } from "@/hooks/useAllowance";
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

  const { isApprovalNeeded, approve, approveConfig } = useAllowance({
    tokenAddress: syntheticToken.address,
    spender: transmuter.address,
    amount: depositAmount,
    decimals: syntheticToken.decimals,
  });

  const {
    data: depositConfig,
    isFetching,
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
    }
  }, [depositReceipt, queryClient]);

  const onCtaClick = useCallback(() => {
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
  }, [
    isApprovalNeeded,
    depositConfigError,
    depositConfig,
    approveConfig,
    approve,
    deposit,
  ]);

  return (
    <>
      <TokenInput
        amount={depositAmount}
        setAmount={setDepositAmount}
        tokenAddress={syntheticToken.address}
        tokenSymbol={syntheticToken.symbol}
        tokenDecimals={syntheticToken.decimals}
      />
      <Button
        variant="outline"
        onClick={onCtaClick}
        disabled={isFetching || isInputZero(depositAmount)}
      >
        {isApprovalNeeded ? "Approve" : "Deposit"}
      </Button>
    </>
  );
};
