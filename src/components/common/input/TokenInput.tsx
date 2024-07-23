import { erc20Abi, formatEther, formatUnits } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { cn } from "@/utils/cn";
import { GAS_ADDRESS } from "@/lib/constants";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { Button } from "@/components/ui/button";

export const TokenInput = ({
  amount,
  setAmount,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  type = "Balance",
  overrideBalance,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  type?: "Balance" | "Available";
  overrideBalance?: string;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: gasBalance, queryKey: gasBalanceQueryKey } = useBalance({
    address,
    chainId: chain.id,
    query: {
      enabled: !overrideBalance,
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
        enabled: !!address && !overrideBalance,
        select: (balance) => formatUnits(balance, tokenDecimals),
      },
    });

  useWatchQuery({
    queryKeys: [gasBalanceQueryKey, tokenBalanceQueryKey],
  });

  const handleMax = () => {
    if (overrideBalance) {
      return setAmount(overrideBalance);
    }
    if (tokenAddress === GAS_ADDRESS && gasBalance) {
      return setAmount(gasBalance);
    }
    if (tokenAddress !== GAS_ADDRESS && tokenBalance) {
      return setAmount(tokenBalance);
    }
  };

  const handleClear = () => {
    setAmount("");
  };

  const balance = overrideBalance
    ? overrideBalance
    : tokenAddress === GAS_ADDRESS
      ? gasBalance
      : tokenBalance;

  return (
    <div className="flex flex-grow flex-col lg:flex-row">
      <div className="relative flex-grow">
        <p className="pointer-events-none absolute left-2 inline-block p-2 text-xs font-light text-lightgrey10 lg:text-sm">
          {type}: {formatNumber(balance)}{" "}
          {tokenAddress === GAS_ADDRESS
            ? chain.nativeCurrency.symbol
            : tokenSymbol}
        </p>
        <Input
          type="number"
          value={amount}
          className={cn(
            "mb-2 h-full rounded-none p-4 text-right text-xl",
            balance !== undefined &&
              +amount > +balance &&
              "text-red-500 ring-2 ring-red-500 focus-visible:ring-red-500",
          )}
          placeholder="0.00"
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="flex lg:flex-col">
        <Button
          variant="action"
          weight="normal"
          className="h-10 w-full rounded-b-none rounded-l-none border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100"
          onClick={handleMax}
        >
          MAX
        </Button>
        <Button
          variant="action"
          weight="normal"
          className="h-10 w-full rounded-l-none rounded-t-none border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100"
          onClick={handleClear}
        >
          CLEAR
        </Button>
      </div>
    </div>
  );
};
