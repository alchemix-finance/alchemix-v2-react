import { transmuterV2Abi } from "@/abi/transmuterV2";
import { TransmuterInput } from "@/components/common/input/TransmuterInput";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { Button } from "@/components/ui/button";
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

export const Claim = ({
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

  const [amount, setAmount] = useState("");

  const {
    data: claimConfig,
    isFetching,
    error: claimConfigError,
  } = useSimulateContract({
    address: transmuter.address,
    abi: transmuterV2Abi,
    functionName: "claim",
    args: [parseEther(amount), address!],
    query: {
      enabled: !!address && !isInputZero(amount),
    },
  });

  const { writeContract: claim, data: claimHash } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        addRecentTransaction({
          hash,
          description: "Claim from transmuter",
        });
        const miningPromise = publicClient.waitForTransactionReceipt({
          hash,
        });
        toast.promise(miningPromise, {
          loading: "Claiming...",
          success: "Claim confirmed",
          error: (e) => {
            return e instanceof WaitForTransactionReceiptTimeoutError
              ? "We could not confirm your claim. Please check your wallet."
              : "Claim failed";
          },
        });
      },
      onError: (error) => {
        toast.error("Claim failed", {
          description: error.message,
        });
      },
    },
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
      />

      <Button
        variant="outline"
        onClick={onCtaClick}
        disabled={isFetching || isInputZero(amount)}
      >
        Withdraw
      </Button>
    </>
  );
};
