import { erc20Abi, formatEther, formatUnits } from "viem";
import { useAccount, useBalance, useBlockNumber, useReadContract } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/utils/cn";
import {
  AmountQuickOptions,
  PercentQuickOptions,
} from "@/components/common/input/InputQuickOptions";
import { GAS_ADDRESS } from "@/lib/constants";

export const TokenInput = ({
  amount,
  setAmount,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  showAmountOptions = false,
  showPercentOptions = false,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  showAmountOptions?: boolean;
  showPercentOptions?: boolean;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({
    chainId: chain.id,
    watch: true,
  });

  const { data: gasBalance, queryKey: gasBalanceQueryKey } = useBalance({
    address,
    chainId: chain.id,
    query: {
      select: (balance) => formatEther(balance.value),
    },
  });
  const { data: tokenBalance, queryKey: tokenBalanceQueryKey } =
    useReadContract({
      address: tokenAddress,
      chainId: chain.id,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address!],
      query: {
        enabled: !!address,
        select: (balance) => formatUnits(balance, tokenDecimals),
      },
    });

  useEffect(() => {
    if (blockNumber) {
      queryClient.invalidateQueries({ queryKey: gasBalanceQueryKey });
      queryClient.invalidateQueries({ queryKey: tokenBalanceQueryKey });
    }
  }, [blockNumber, queryClient, gasBalanceQueryKey, tokenBalanceQueryKey]);

  const setMax = () => {
    if (tokenAddress === GAS_ADDRESS && gasBalance) {
      return setAmount(gasBalance);
    }
    if (tokenAddress !== GAS_ADDRESS && tokenBalance) {
      return setAmount(tokenBalance);
    }
  };

  const balance = tokenAddress === GAS_ADDRESS ? gasBalance : tokenBalance;

  return (
    <div className="flex flex-col">
      <p
        className={cn(
          "inline-block self-end text-sm font-light",
          balance !== "0" && "cursor-pointer",
        )}
        onClick={setMax}
      >
        Balance: {formatNumber(balance)}{" "}
        {tokenAddress === GAS_ADDRESS
          ? chain.nativeCurrency.symbol
          : tokenSymbol}
      </p>
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className={cn(
          "mb-2",
          balance !== undefined &&
            +amount > +balance &&
            "text-red-500 ring-2 ring-red-500 focus-visible:ring-red-500",
        )}
      />
      {showAmountOptions && (
        <AmountQuickOptions value={amount} setValue={setAmount} />
      )}
      {showPercentOptions && (
        <PercentQuickOptions
          percentOf={tokenAddress === GAS_ADDRESS ? gasBalance : tokenBalance}
          value={amount}
          setValue={setAmount}
        />
      )}
    </div>
  );
};
