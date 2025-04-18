import { erc20Abi, formatEther, formatUnits } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { transmuterV2Abi } from "@/abi/transmuterV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { useChain } from "@/hooks/useChain";
import { Input } from "@/components/ui/input";
import { formatInput, formatNumber, sanitizeNumber } from "@/utils/number";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { decimalNumberValidationRegex } from "@/utils/inputValidation";
import { ScopeKeys } from "@/lib/queries/queriesSchema";

export const TransmuterInput = ({
  amount,
  setAmount,
  tokenAddress,
  tokenDecimals,
  transmuterAddress,
  type,
  tokenSymbol,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  tokenAddress: `0x${string}`;
  tokenDecimals: number;
  transmuterAddress: `0x${string}`;
  type: "Available" | "Claimable" | "Balance";
  tokenSymbol: string;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: tokenBalance } = useReadContract({
    address: tokenAddress,
    chainId: chain.id,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
    scopeKey: ScopeKeys.TransmuterInput,
    query: {
      enabled: !!address && type === "Balance",
      select: (balance) => formatUnits(balance, tokenDecimals),
    },
  });

  const { data: transmuterBalance } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: transmuterAddress,
        abi: transmuterV2Abi,
        functionName: "getUnexchangedBalance",
        args: [address!],
        chainId: chain.id,
      },
      {
        address: transmuterAddress,
        abi: transmuterV2Abi,
        functionName: "getClaimableBalance",
        args: [address!],
        chainId: chain.id,
      },
    ],
    scopeKey: ScopeKeys.TransmuterInput,
    query: {
      enabled: !!address && type !== "Balance",
      select: ([unexchangedBalance, claimableBalance]) =>
        [
          formatEther(unexchangedBalance),
          formatUnits(claimableBalance, tokenDecimals),
        ] as const,
    },
  });
  const [unexchangedBalance, claimableBalance] = transmuterBalance ?? [];

  useWatchQuery({
    scopeKey: ScopeKeys.TransmuterInput,
  });

  const balance =
    type === "Balance"
      ? tokenBalance
      : type === "Available"
        ? unexchangedBalance
        : claimableBalance;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumber(e.target.value, tokenDecimals);
    setAmount(sanitized);
  };

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    if (formatted !== e.target.value) setAmount(formatted);
  };

  const handleMax = () => {
    if (balance) {
      return setAmount(balance);
    }
  };

  const handleClear = () => {
    setAmount("");
  };

  return (
    <div className="space-y-4">
      <p className="text-lightgrey10 text-xs font-light lg:text-sm">
        {type}: {formatNumber(balance)} {tokenSymbol}
      </p>
      <div className="flex flex-col lg:flex-row">
        <div className="relative grow">
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
            className="bg-grey3inverse text-lightgrey10inverse/80 hover:bg-grey1inverse hover:text-lightgrey10inverse dark:bg-grey3 dark:text-lightgrey10/80 dark:hover:text-lightgrey10 dark:hover:bg-grey1 h-10 w-full rounded-l-none rounded-b-none border-0 transition-all"
            onClick={handleMax}
          >
            MAX
          </Button>
          <Button
            variant="action"
            weight="normal"
            className="bg-grey3inverse text-lightgrey10inverse/80 hover:bg-grey1inverse hover:text-lightgrey10inverse dark:bg-grey3 dark:text-lightgrey10/80 dark:hover:text-lightgrey10 dark:hover:bg-grey1 h-10 w-full rounded-t-none rounded-l-none border-0 transition-all"
            onClick={handleClear}
          >
            CLEAR
          </Button>
        </div>
      </div>
    </div>
  );
};
