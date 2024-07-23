import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { cn } from "@/utils/cn";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { Button } from "@/components/ui/button";

export const LiquidateTokenInput = ({
  amount,
  setAmount,
  vault,
  tokenSymbol,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  vault: Vault;
  tokenSymbol: string;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: shares, queryKey: sharesBalanceQueryKey } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "positions",
    args: [address!, vault.yieldToken],
    query: {
      enabled: !!address,
      select: ([shares]) => shares,
    },
  });

  const { data: balance } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertSharesToYieldTokens",
    args: [vault.yieldToken, shares ?? 0n],
    query: {
      enabled: shares !== undefined,
      select: (balance) =>
        formatUnits(balance, vault.yieldTokenParams.decimals),
    },
  });

  useWatchQuery({
    queryKey: sharesBalanceQueryKey,
  });

  const handleMax = () => {
    if (balance) {
      setAmount(balance);
    }
  };

  const handleClear = () => {
    setAmount("");
  };

  return (
    <div className="flex flex-grow flex-col lg:flex-row">
      <div className="relative flex-grow">
        <p className="pointer-events-none absolute left-2 inline-block p-2 text-xs font-light text-lightgrey10 lg:text-sm">
          Available: {formatNumber(balance)} {tokenSymbol}
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
          className="h-10 w-full border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100"
          onClick={handleMax}
        >
          MAX
        </Button>
        <Button
          variant="action"
          weight="normal"
          className="h-10 w-full border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100"
          onClick={handleClear}
        >
          CLEAR
        </Button>
      </div>
    </div>
  );
};
