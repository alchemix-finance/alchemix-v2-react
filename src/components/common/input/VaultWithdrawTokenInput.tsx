import { useAccount, useReadContract } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { cn } from "@/utils/cn";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { formatUnits } from "viem";
import { useWatchQuery } from "@/hooks/useWatchQuery";

export const VaultWithdrawTokenInput = ({
  amount,
  setAmount,
  tokenSymbol,
  vault,
  isSelectedTokenYieldToken,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  tokenSymbol: string;
  vault: Vault;
  isSelectedTokenYieldToken: boolean;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: sharesBalance, queryKey: sharesBalanceQueryKey } =
    useReadContract({
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

  useWatchQuery({
    queryKey: sharesBalanceQueryKey,
  });

  const { data: yieldTokenBalance } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertSharesToYieldTokens",
    args: [vault.yieldToken, sharesBalance ?? 0n],
    query: {
      enabled: sharesBalance !== undefined && isSelectedTokenYieldToken,
      select: (balance) =>
        formatUnits(balance, vault.yieldTokenParams.decimals),
    },
  });

  const { data: underlyingTokenBalance } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertSharesToUnderlyingTokens",
    args: [vault.yieldToken, sharesBalance ?? 0n],
    query: {
      enabled: sharesBalance !== undefined && !isSelectedTokenYieldToken,
      select: (balance) =>
        formatUnits(balance, vault.yieldTokenParams.decimals),
    },
  });

  const balance = isSelectedTokenYieldToken
    ? yieldTokenBalance
    : underlyingTokenBalance;

  const setMax = () => {
    if (balance) {
      return setAmount(balance);
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
