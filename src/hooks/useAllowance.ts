import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useChain } from "@/hooks/useChain";
import { erc20Abi, parseUnits } from "viem";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { GAS_ADDRESS } from "@/lib/constants";
import { isInputZero } from "@/utils/inputNotZero";
import { useWriteContractMutationCallback } from "./useWriteContractMutationCallback";

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
  const mutationCallback = useWriteContractMutationCallback();

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

  const { writeContract: approve, data: approveTxHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Approve",
    }),
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
