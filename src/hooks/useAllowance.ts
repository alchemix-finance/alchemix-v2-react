import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useChain } from "@/hooks/useChain";
import {
  WaitForTransactionReceiptTimeoutError,
  erc20Abi,
  parseUnits,
} from "viem";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { GAS_ADDRESS } from "@/lib/constants";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { isInputZero } from "@/utils/inputNotZero";

export const useAllowance = ({
  tokenAddress,
  spender,
  amount,
  decimals = 18,
}: {
  tokenAddress: `0x${string}` | undefined;
  spender: `0x${string}`;
  amount: string;
  decimals: number | undefined;
}) => {
  const chain = useChain();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const addRecentTransaction = useAddRecentTransaction();

  const { data: isApprovalNeeded, queryKey: isApprovalNeededQueryKey } =
    useReadContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "allowance",
      args: [address!, spender],
      chainId: chain.id,
      query: {
        enabled: !!address && spender !== GAS_ADDRESS,
        select: (allowance) => allowance < parseUnits(amount, decimals),
      },
    });

  const { data: approveConfig } = useSimulateContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "approve",
    chainId: chain.id,
    args: [spender, parseUnits(amount, decimals)],
    query: {
      enabled: !isInputZero(amount) && !!address && spender !== GAS_ADDRESS,
    },
  });

  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const { writeContract: approve, data: approveTxHash } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        addRecentTransaction({
          hash,
          description: "Approve token",
        });
        const miningPromise = publicClient.waitForTransactionReceipt({
          hash,
        });
        toast.promise(miningPromise, {
          loading: "Approving...",
          success: "Approval confirmed",
          error: (e) => {
            return e instanceof WaitForTransactionReceiptTimeoutError
              ? "We could not confirm your approval. Please check your wallet."
              : "Approval failed";
          },
        });
      },
      onError: (error) => {
        toast.error("Approval failed", {
          description: error.message,
        });
      },
    },
  });

  const { data: approvalReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: approveTxHash,
  });

  useEffect(() => {
    if (approvalReceipt) {
      queryClient.invalidateQueries({ queryKey: isApprovalNeededQueryKey });
    }
  }, [approvalReceipt, isApprovalNeededQueryKey, queryClient]);

  return {
    isApprovalNeeded,
    approve,
    approveConfig,
  };
};
