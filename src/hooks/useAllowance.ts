import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useChain } from "@/hooks/useChain";
import { erc20Abi, parseAbi, parseUnits } from "viem";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  GAS_ADDRESS,
  MAX_UINT256_BN,
  USDT_MAINNET_ADDRESS,
} from "@/lib/constants";
import { isInputZero } from "@/utils/inputNotZero";
import { useWriteContractMutationCallback } from "./useWriteContractMutationCallback";

export const useAllowance = ({
  tokenAddress,
  spender,
  amount,
  decimals = 18,
  isInfiniteApproval = false,
}: {
  tokenAddress: `0x${string}` | undefined;
  spender: `0x${string}`;
  amount: string;
  decimals: number | undefined;
  isInfiniteApproval?: boolean;
}) => {
  const chain = useChain();
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const mutationCallback = useWriteContractMutationCallback();

  const {
    data: allowanceData,
    queryKey: isApprovalNeededQueryKey,
    isPending: isPendingAllowance,
    isFetching: isFetchingAllowance,
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address!, spender],
    chainId: chain.id,
    query: {
      enabled:
        !!address && tokenAddress !== GAS_ADDRESS && !isInputZero(amount),
      select: (allowance) => ({
        isApprovalNeeded: allowance < parseUnits(amount, decimals),
        allowance,
      }),
    },
  });

  const { isApprovalNeeded, allowance } = allowanceData ?? {};

  const { data: approveConfig, isPending: isPendingApproveConfigToken } =
    useSimulateContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: "approve",
      chainId: chain.id,
      args: [
        spender,
        isInfiniteApproval ? MAX_UINT256_BN : parseUnits(amount, decimals),
      ],
      query: {
        enabled:
          !isInputZero(amount) &&
          !!address &&
          isApprovalNeeded === true &&
          tokenAddress !== GAS_ADDRESS &&
          tokenAddress?.toLowerCase() !== USDT_MAINNET_ADDRESS.toLowerCase(),
      },
    });

  /** USDT on Ethereum doesn't follow ERC20 standard.
   * https://etherscan.io/address/0xdac17f958d2ee523a2206206994597c13d831ec7#code#L199
   */
  const {
    data: approveUsdtEthConfig,
    isPending: isPendingApproveConfigUsdtEth,
  } = useSimulateContract({
    address: tokenAddress,
    abi: parseAbi(["function approve(address _spender, uint _value) public"]),
    functionName: "approve",
    args: [spender, allowance ? 0n : MAX_UINT256_BN],
    query: {
      enabled:
        !isInputZero(amount) &&
        !!address &&
        isApprovalNeeded === true &&
        allowance !== undefined &&
        tokenAddress?.toLowerCase() === USDT_MAINNET_ADDRESS.toLowerCase(),
    },
  });

  const {
    writeContract: approve,
    data: approveTxHash,
    reset: resetApprove,
  } = useWriteContract({
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
      resetApprove();
    }
  }, [approvalReceipt, isApprovalNeededQueryKey, resetApprove, queryClient]);

  const isPending = (() => {
    if (isApprovalNeeded) {
      if (tokenAddress?.toLowerCase() === USDT_MAINNET_ADDRESS.toLowerCase()) {
        return isPendingApproveConfigUsdtEth || isPendingAllowance;
      }
      return isPendingApproveConfigToken || isPendingAllowance;
    } else return isPendingAllowance;
  })();

  return {
    isApprovalNeeded,
    approve,
    approveConfig,
    approveUsdtEthConfig,
    isPending,
    isFetching: isFetchingAllowance,
  };
};
