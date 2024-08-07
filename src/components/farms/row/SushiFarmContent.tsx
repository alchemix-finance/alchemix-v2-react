import { useAllowance } from "@/hooks/useAllowance";
import { useChain } from "@/hooks/useChain";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { SUSHI } from "@/lib/config/farms";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Farm } from "@/lib/types";
import { isInputZero } from "@/utils/inputNotZero";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { formatEther, parseEther, zeroAddress } from "viem";
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { sushiMasterchefAbi } from "@/abi/sushiMasterchef";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { FarmContent } from "./FarmContent";

export const SushiFarmContent = ({ farm }: { farm: Farm }) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();
  const queryClient = useQueryClient();
  const receiptCallback = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.Farms("curve")],
    });
  }, [queryClient]);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { address = zeroAddress } = useAccount();

  const { data: withdrawBalance, queryKey: balanceQueryKey } = useReadContract({
    address: SUSHI.masterchef,
    abi: sushiMasterchefAbi,
    chainId: chain.id,
    functionName: "userInfo",
    args: [0n, address],
    query: {
      select: ([balance]) => formatEther(balance),
    },
  });
  useWatchQuery({
    queryKey: balanceQueryKey,
  });

  //-- Deposit --//
  const { isApprovalNeeded, approveConfig, approve } = useAllowance({
    tokenAddress: farm.poolTokenAddress,
    spender: SUSHI.masterchef,
    amount: depositAmount,
    decimals: 18,
  });

  const { data: depositConfig } = useSimulateContract({
    address: SUSHI.masterchef,
    abi: sushiMasterchefAbi,
    chainId: chain.id,
    functionName: "deposit",
    args: [0n, parseEther(depositAmount), address],
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
    address: SUSHI.masterchef,
    abi: sushiMasterchefAbi,
    chainId: chain.id,
    functionName: "withdraw",
    args: [0n, parseEther(withdrawAmount), address],
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
    address: SUSHI.masterchef,
    abi: sushiMasterchefAbi,
    chainId: chain.id,
    functionName: "harvest",
    args: [0n, address],
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
