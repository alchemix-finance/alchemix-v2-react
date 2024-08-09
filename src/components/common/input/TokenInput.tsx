import { erc20Abi, formatEther, formatUnits, zeroAddress } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatInput, formatNumber, sanitizeNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { cn } from "@/utils/cn";
import { GAS_ADDRESS } from "@/lib/constants";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { Button } from "@/components/ui/button";
import { decimalNumberValidationRegex } from "@/utils/inputValidation";

export const TokenInput = ({
  amount,
  setAmount,
  tokenAddress,
  tokenSymbol,
  tokenDecimals,
  type = "Balance",
  overrideBalance,
  externalMaximumAmount,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  type?: "Balance" | "Available" | "Claimable";
  overrideBalance?: string;
  externalMaximumAmount?: string;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: gasBalance, queryKey: gasBalanceQueryKey } = useBalance({
    address,
    chainId: chain.id,
    query: {
      enabled: !overrideBalance && tokenAddress === GAS_ADDRESS,
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
        enabled:
          !!address &&
          !overrideBalance &&
          tokenAddress !== GAS_ADDRESS &&
          tokenAddress !== zeroAddress,
        select: (balance) => formatUnits(balance, tokenDecimals),
      },
    });

  useWatchQuery({
    queryKeys: [gasBalanceQueryKey, tokenBalanceQueryKey],
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumber(e.target.value, tokenDecimals);
    setAmount(sanitized);
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    if (formatted !== e.target.value) setAmount(formatted);
  };

  const handleMax = () => {
    if (externalMaximumAmount) {
      return setAmount(externalMaximumAmount);
    }
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
          type="text"
          inputMode="decimal"
          pattern={decimalNumberValidationRegex}
          value={amount}
          className={cn(
            "mb-2 h-full rounded-none p-4 text-right text-xl",
            balance !== undefined &&
              +amount > +balance &&
              "text-red-500 ring-2 ring-red-500 focus-visible:ring-red-500",
          )}
          placeholder="0.00"
          onChange={onChange}
          onBlur={onBlur}
        />
      </div>
      <div className="flex lg:flex-col">
        <Button
          variant="action"
          weight="normal"
          className="h-10 w-full rounded-b-none rounded-l-none border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100 dark:bg-grey3 dark:text-lightgrey10 dark:hover:bg-grey1"
          onClick={handleMax}
        >
          MAX
        </Button>
        <Button
          variant="action"
          weight="normal"
          className="h-10 w-full rounded-l-none rounded-t-none border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100 dark:bg-grey3 dark:text-lightgrey10 dark:hover:bg-grey1"
          onClick={handleClear}
        >
          CLEAR
        </Button>
      </div>
    </div>
  );
};
