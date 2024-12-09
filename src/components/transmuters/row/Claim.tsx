import { transmuterV2Abi } from "@/abi/transmuterV2";
import { CtaButton } from "@/components/common/CtaButton";
import { TransmuterInput } from "@/components/common/input/TransmuterInput";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { QueryKeys, ScopeKeys } from "@/lib/queries/queriesSchema";
import { Token, Transmuter } from "@/lib/types";
import { invalidateWagmiUseQueryPredicate } from "@/utils/helpers/invalidateWagmiUseQueryPredicate";
import { isInputZero } from "@/utils/inputNotZero";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export const Claim = ({
  transmuter,
  underlyingToken,
}: {
  transmuter: Transmuter;
  underlyingToken: Token;
}) => {
  const chain = useChain();
  const queryClient = useQueryClient();
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  const [amount, setAmount] = useState("");

  const {
    data: claimConfig,
    isPending,
    error: claimConfigError,
  } = useSimulateContract({
    address: transmuter.address,
    abi: transmuterV2Abi,
    chainId: chain.id,
    functionName: "claim",
    args: [parseUnits(amount, underlyingToken.decimals), address!],
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
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQueryPredicate({
            query,
            scopeKey: ScopeKeys.TransmuterInput,
          }),
      });
    }
  }, [claimReceipt, queryClient]);

  const onCtaClick = () => {
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
  };

  return (
    <>
      <TransmuterInput
        type="Claimable"
        amount={amount}
        setAmount={setAmount}
        transmuterAddress={transmuter.address}
        tokenSymbol={underlyingToken.symbol}
        tokenAddress={underlyingToken.address}
        tokenDecimals={underlyingToken.decimals}
      />

      <p className="text-xs font-light text-lightgrey10 lg:text-sm">&nbsp;</p>

      <CtaButton
        variant="outline"
        onClick={onCtaClick}
        disabled={isPending || isInputZero(amount)}
      >
        Claim
      </CtaButton>
    </>
  );
};
