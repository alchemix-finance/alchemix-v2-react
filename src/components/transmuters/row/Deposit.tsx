import { transmuterV2Abi } from "@/abi/transmuterV2";
import { TokenInput } from "@/components/common/input/TokenInput";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { Button } from "@/components/ui/button";
import { useAllowance } from "@/hooks/useAllowance";
import { useChain } from "@/hooks/useChain";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Token, Transmuter } from "@/lib/types";
import { isInputZero } from "@/utils/inputNotZero";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WaitForTransactionReceiptTimeoutError, parseEther } from "viem";
import {
  useAccount,
  usePublicClient,
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
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const queryClient = useQueryClient();
  const addRecentTransaction = useAddRecentTransaction();

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
    functionName: "deposit",
    args: [parseEther(depositAmount), address!],
    query: {
      enabled:
        !!address && !isInputZero(depositAmount) && isApprovalNeeded === false,
    },
  });

  const { writeContract: deposit, data: depositHash } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        addRecentTransaction({
          hash,
          description: "Deposit into transmuter",
        });
        const miningPromise = publicClient.waitForTransactionReceipt({
          hash,
        });
        toast.promise(miningPromise, {
          loading: "Depositing...",
          success: "Deposit confirmed",
          error: (e) => {
            return e instanceof WaitForTransactionReceiptTimeoutError
              ? "We could not confirm your deposit. Please check your wallet."
              : "Deposit failed";
          },
        });
      },
      onError: (error) => {
        toast.error("Deposit failed", {
          description: error.message,
        });
      },
    },
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
