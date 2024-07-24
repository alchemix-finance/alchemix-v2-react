import { stakingPoolsAbi } from "@/abi/stakingPools";
import { useAllowance } from "@/hooks/useAllowance";
import { useChain } from "@/hooks/useChain";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { stakingPoolsAddresses } from "@/lib/config/farms";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Farm } from "@/lib/types";
import { isInputZero } from "@/utils/inputNotZero";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { formatEther, parseEther, zeroAddress } from "viem";
import { mainnet } from "viem/chains";
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { FarmContent } from "./FarmContent";

export const InternalFarmContent = ({ farm }: { farm: Farm }) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();
  const queryClient = useQueryClient();
  const receiptCallback = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.Farms("internal")],
    });
  }, [queryClient]);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { address = zeroAddress } = useAccount();

  const { data: withdrawBalance, queryKey: balanceQueryKey } = useReadContract({
    address: stakingPoolsAddresses[mainnet.id],
    abi: stakingPoolsAbi,
    chainId: chain.id,
    functionName: "getStakeTotalDeposited",
    args: [address, BigInt(farm.poolId)],
    query: {
      select: (data) => formatEther(data),
    },
  });
  useWatchQuery({
    queryKey: balanceQueryKey,
  });

  //-- Deposit --//
  const { isApprovalNeeded, approveConfig, approve } = useAllowance({
    tokenAddress: farm.poolTokenAddress,
    spender: stakingPoolsAddresses[mainnet.id],
    amount: depositAmount,
    decimals: 18,
  });

  const { data: depositConfig } = useSimulateContract({
    address: stakingPoolsAddresses[mainnet.id],
    abi: stakingPoolsAbi,
    chainId: chain.id,
    functionName: "deposit",
    args: [BigInt(farm.poolId), parseEther(depositAmount)],
    query: {
      enabled: !isInputZero(depositAmount) && isApprovalNeeded === false,
    },
  });

  const { writeContract: deposit, data: depositHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Deposit",
    }),
  });

  const { data: depositReceipt } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  useEffect(() => {
    if (depositReceipt) {
      receiptCallback();
    }
  }, [depositReceipt, queryClient, receiptCallback]);

  const onDeposit = () => {
    if (isApprovalNeeded) {
      approveConfig && approve(approveConfig.request);
    } else {
      depositConfig && deposit(depositConfig.request);
    }
  };

  //-- Withdraw --//
  const { data: withdrawConfig } = useSimulateContract({
    address: stakingPoolsAddresses[mainnet.id],
    abi: stakingPoolsAbi,
    chainId: chain.id,
    functionName: "withdraw",
    args: [BigInt(farm.poolId), parseEther(withdrawAmount)],
    query: {
      enabled: !isInputZero(withdrawAmount),
    },
  });

  const { writeContract: withdraw, data: withdrawHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Withdraw",
    }),
  });

  const { data: withdrawReceipt } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  });

  useEffect(() => {
    if (withdrawReceipt) {
      receiptCallback();
    }
  }, [withdrawReceipt, queryClient, receiptCallback]);

  const onWithdraw = () => {
    withdrawConfig && withdraw(withdrawConfig.request);
  };

  //-- Claim --//
  const { data: claimConfig } = useSimulateContract({
    address: stakingPoolsAddresses[mainnet.id],
    abi: stakingPoolsAbi,
    chainId: chain.id,
    functionName: "claim",
    args: [BigInt(farm.poolId)],
  });

  const { writeContract: claim, data: claimHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Claim",
    }),
  });

  const { data: claimReceipt } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  useEffect(() => {
    if (claimReceipt) {
      receiptCallback();
    }
  }, [claimReceipt, queryClient, receiptCallback]);

  const onClaim = () => {
    claimConfig && claim(claimConfig.request);
  };

  const isDisabled =
    farm.rewards.reduce((acc, rew) => acc + +rew.amount, 0) === 0;

  return (
    <FarmContent
      depositAmount={depositAmount}
      setDepositAmount={setDepositAmount}
      onDeposit={onDeposit}
      isApprovalNeeded={isApprovalNeeded}
      withdrawAmount={withdrawAmount}
      setWithdrawAmount={setWithdrawAmount}
      onWithdraw={onWithdraw}
      onClaim={onClaim}
      isDisabled={isDisabled}
      poolTokenAddress={farm.poolTokenAddress}
      tokenSymbol={farm.tokenSymbol}
      withdrawBalance={withdrawBalance}
      rewards={farm.rewards}
    />
  );
};
