import { transmuterV2Abi } from "@/abi/transmuterV2";
import { CtaButton } from "@/components/common/CtaButton";
import { TransmuterInput } from "@/components/common/input/TransmuterInput";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { QueryKeys, ScopeKeys } from "@/lib/queries/queriesSchema";
import { Token, Transmuter } from "@/lib/types";
import { invalidateWagmiUseQuery } from "@/utils/helpers/invalidateWagmiUseQuery";
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

export const Withdraw = ({
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

  const [withdrawAmount, setWithdrawAmount] = useState("");

  const {
    data: withdrawConfig,
    isPending,
    error: withdrawConfigError,
  } = useSimulateContract({
    address: transmuter.address,
    abi: transmuterV2Abi,
    chainId: chain.id,
    functionName: "withdraw",
    args: [parseEther(withdrawAmount), address!],
    query: {
      enabled: !!address && !isInputZero(withdrawAmount),
    },
  });

  const { writeContract: withdraw, data: withdrawHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Withdraw from transmuter",
    }),
  });

  const { data: withdrawReceipt } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  useEffect(() => {
    if (withdrawReceipt) {
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Transmuters] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQuery({
            query,
            scopeKey: ScopeKeys.TransmuterInput,
          }),
      });
    }
  }, [withdrawReceipt, queryClient]);

  const onCtaClick = () => {
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
  };

  return (
    <>
      <TransmuterInput
        amount={withdrawAmount}
        setAmount={setWithdrawAmount}
        transmuterAddress={transmuter.address}
        tokenSymbol={syntheticToken.symbol}
        type="Available"
        tokenAddress={syntheticToken.address}
        tokenDecimals={syntheticToken.decimals}
      />

      <CtaButton
        variant="outline"
        onClick={onCtaClick}
        disabled={isPending || isInputZero(withdrawAmount)}
      >
        Withdraw
      </CtaButton>
    </>
  );
};
