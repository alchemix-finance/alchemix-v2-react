import { transmuterV2Abi } from "@/abi/transmuterV2";
import { TransmuterInput } from "@/components/common/input/TransmuterInput";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { Button } from "@/components/ui/button";
import { useChain } from "@/hooks/useChain";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Token, Transmuter } from "@/lib/types";
import { mutationCallback } from "@/utils/helpers/mutationCallback";
import { isInputZero } from "@/utils/inputNotZero";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import {
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export const Withdraw = ({
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

  const [withdrawAmount, setWithdrawAmount] = useState("");

  const {
    data: withdrawConfig,
    isFetching,
    error: withdrawConfigError,
  } = useSimulateContract({
    address: transmuter.address,
    abi: transmuterV2Abi,
    functionName: "withdraw",
    args: [parseEther(withdrawAmount), address!],
    query: {
      enabled: !!address && !isInputZero(withdrawAmount),
    },
  });

  const { writeContract: withdraw, data: withdrawHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Withdraw from transmuter",
      addRecentTransaction,
      publicClient,
    }),
  });

  const { data: withdrawReceipt } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  useEffect(() => {
    if (withdrawReceipt) {
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Transmuters] });
    }
  }, [withdrawReceipt, queryClient]);

  const onCtaClick = useCallback(() => {
    if (withdrawConfigError) {
      toast.error("Withdraw failed", {
        description:
          withdrawConfigError.name === "ContractFunctionExecutionError"
            ? withdrawConfigError.cause.message
            : withdrawConfigError.message,
      });
      return;
    }
    if (withdrawConfig) {
      withdraw(withdrawConfig.request);
    } else {
      toast.error("Withdraw failed", {
        description: "Unknown error occurred. Please contact Alchemix team.",
      });
    }
  }, [withdraw, withdrawConfig, withdrawConfigError]);

  return (
    <>
      <TransmuterInput
        amount={withdrawAmount}
        setAmount={setWithdrawAmount}
        transmuterAddress={transmuter.address}
        tokenSymbol={syntheticToken.symbol}
        type="Available"
      />

      <Button
        variant="outline"
        onClick={onCtaClick}
        disabled={isFetching || isInputZero(withdrawAmount)}
      >
        Withdraw
      </Button>
    </>
  );
};
