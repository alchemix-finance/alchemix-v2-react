import { erc20Abi, formatEther, formatUnits } from "viem";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { transmuterV2Abi } from "@/abi/transmuterV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { useChain } from "@/hooks/useChain";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

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

  const { data: tokenBalance, queryKey: tokenBalanceQueryKey } =
    useReadContract({
      address: tokenAddress,
      chainId: chain.id,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address!],
      query: {
        enabled: !!address && type === "Balance",
        select: (balance) => formatUnits(balance, tokenDecimals),
      },
    });

  const { data: transmuterBalance, queryKey: transmuterBalanceQueryKey } =
    useReadContracts({
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
      query: {
        enabled: !!address && type !== "Balance",
        select: (balances) => balances.map((balance) => formatEther(balance)),
      },
    });
  const [unexchangedBalance, claimableBalance] = transmuterBalance ?? [];

  useWatchQuery({
    queryKeys: [tokenBalanceQueryKey, transmuterBalanceQueryKey],
  });

  const balance =
    type === "Balance"
      ? tokenBalance
      : type === "Available"
        ? unexchangedBalance
        : claimableBalance;

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
      <p className="text-xs font-light text-lightgrey10 lg:text-sm">
        {type}: {formatNumber(balance)} {tokenSymbol}
      </p>
      <div className="flex flex-col lg:flex-row">
        <div className="relative flex-grow">
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
    </div>
  );
};
