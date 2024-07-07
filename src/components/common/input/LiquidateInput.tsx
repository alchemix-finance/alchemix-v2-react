import { formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { cn } from "@/utils/cn";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";

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

  const setMax = () => {
    if (balance) {
      setAmount(balance);
    }
  };

  return (
    <div className="flex flex-col">
      <p
        className={cn(
          "inline-block self-end text-sm font-light",
          balance !== "0" && "cursor-pointer",
        )}
        onClick={setMax}
      >
        Available: {formatNumber(balance)} {tokenSymbol}
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
    </div>
  );
};
