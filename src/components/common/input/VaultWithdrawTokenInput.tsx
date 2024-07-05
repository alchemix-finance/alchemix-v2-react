import { useAccount, useReadContract } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { cn } from "@/utils/cn";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useVaultHelper } from "@/hooks/useVaultHelper";
import { formatUnits } from "viem";
import { useWatchQueryKey } from "@/hooks/useWatchQueryKey";

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

  const { convertSharesToUnderlyingTokens, convertSharesToYieldTokens } =
    useVaultHelper(vault);

  const { data: sharesBalance, queryKey: sharesBalanceQueryKey } =
    useReadContract({
      address: vault.alchemist.address,
      chainId: chain.id,
      abi: alchemistV2Abi,
      functionName: "positions",
      args: [address!, vault.yieldToken],
      query: {
        enabled: !!address,
        select: ([shares]) => {
          if (isSelectedTokenYieldToken) {
            return formatUnits(
              convertSharesToYieldTokens(shares),
              vault.yieldTokenParams.decimals,
            );
          }
          return formatUnits(
            convertSharesToUnderlyingTokens(shares),
            vault.underlyingTokensParams.decimals,
          );
        },
      },
    });

  useWatchQueryKey(sharesBalanceQueryKey);

  const setMax = () => {
    if (sharesBalance) {
      return setAmount(sharesBalance);
    }
  };

  return (
    <div className="flex flex-col">
      <p
        className={cn(
          "inline-block self-end text-sm font-light",
          sharesBalance !== "0" && "cursor-pointer",
        )}
        onClick={setMax}
      >
        Balance: {formatNumber(sharesBalance)} {tokenSymbol}
      </p>
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className={cn(
          "mb-2",
          sharesBalance !== undefined &&
            +amount > +sharesBalance &&
            "text-red-500 ring-2 ring-red-500 focus-visible:ring-red-500",
        )}
      />
    </div>
  );
};
