import { TokenInput } from "@/components/common/input/TokenInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAllowance } from "@/hooks/useAllowance";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { curve } from "@/lib/config/farms";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Farm } from "@/lib/types";
import { cn } from "@/utils/cn";
import { isInputZero } from "@/utils/inputNotZero";
import { formatNumber } from "@/utils/number";
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
import { curveGaugeAbi } from "@/abi/curveGauge";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { useChain } from "@/hooks/useChain";

export const CurveFarmContent = ({ farm }: { farm: Farm }) => {
  const chain = useChain();
  const queryClient = useQueryClient();
  const mutationCallback = useWriteContractMutationCallback();
  const receiptCallback = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: [QueryKeys.Farms("curve")],
    });
  }, [queryClient]);

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const { address = zeroAddress } = useAccount();

  const { data: withdrawBalance, queryKey: balanceQueryKey } = useReadContract({
    address: curve.gauge,
    abi: curveGaugeAbi,
    chainId: chain.id,
    functionName: "balanceOf",
    args: [address],
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
    spender: curve.gauge,
    amount: depositAmount,
    decimals: 18,
  });

  const { data: depositConfig } = useSimulateContract({
    address: curve.gauge,
    abi: curveGaugeAbi,
    chainId: chain.id,
    functionName: "deposit",
    args: [parseEther(depositAmount)],
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
    address: curve.gauge,
    abi: curveGaugeAbi,
    chainId: chain.id,
    functionName: "withdraw",
    args: [parseEther(withdrawAmount)],
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
    address: curve.gauge,
    abi: curveGaugeAbi,
    chainId: chain.id,
    functionName: "claim_rewards",
    // NOTE: This funcion is overloaded in contract. We use the simple one.
    args: [],
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

  const setMaxWithdraw = () => {
    if (withdrawBalance) {
      setWithdrawAmount(withdrawBalance);
    }
  };

  const isDisabled =
    farm.rewards.reduce((acc, rew) => acc + +rew.amount, 0) === 0;

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:gap-8 lg:py-4 lg:pl-8 lg:pr-4">
      <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4">
        <TokenInput
          amount={depositAmount}
          setAmount={setDepositAmount}
          tokenAddress={farm.poolTokenAddress}
          tokenSymbol={farm.tokenSymbol}
          tokenDecimals={18}
        />
        <Button disabled={isInputZero(depositAmount)} onClick={onDeposit}>
          {isApprovalNeeded ? "Approve" : "Deposit"}
        </Button>
      </div>
      <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4">
        <div className="flex flex-col">
          <p
            className={cn(
              "inline-block self-end text-sm font-light text-lightgrey10",
              withdrawBalance !== "0" && "cursor-pointer",
            )}
            onClick={setMaxWithdraw}
          >
            Available: {formatNumber(withdrawBalance)} {farm.tokenSymbol}
          </p>
          <Input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className={cn(
              "mb-2",
              withdrawBalance !== undefined &&
                +withdrawAmount > +withdrawBalance &&
                "text-red-500 ring-2 ring-red-500 focus-visible:ring-red-500",
            )}
          />
        </div>
        <Button
          disabled={
            isInputZero(withdrawAmount) ||
            +withdrawAmount > +(withdrawBalance ?? "0")
          }
          onClick={onWithdraw}
        >
          Withdraw
        </Button>
      </div>

      <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4">
        <label htmlFor="borrowInput" className="text-sm text-lightgrey10">
          Rewards:
        </label>
        <div className="flex rounded border border-grey3inverse bg-grey3inverse">
          {farm.rewards.map((reward) => (
            <div
              key={reward.tokenAddress}
              className="h-full w-full appearance-none rounded bg-grey3inverse px-14 py-6 text-right text-xl"
            >
              {reward.amount} {reward.symbol}
            </div>
          ))}
        </div>
        <Button disabled={isDisabled} onClick={onClaim}>
          Claim
        </Button>
      </div>
    </div>
  );
};
