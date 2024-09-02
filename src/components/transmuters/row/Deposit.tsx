import { transmuterV2Abi } from "@/abi/transmuterV2";
import { CtaButton } from "@/components/common/CtaButton";
import { TransmuterInput } from "@/components/common/input/TransmuterInput";
import { useAllowance } from "@/hooks/useAllowance";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Token, Transmuter } from "@/lib/types";
import { isInputZero } from "@/utils/inputNotZero";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
    }
  }, [depositReceipt, queryClient]);

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
