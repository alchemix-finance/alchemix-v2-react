import { formatUnits } from "viem";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/utils/cn";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";

export const MigrateTokenInput = ({
  amount,
  setAmount,
  vault,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  vault: Vault;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({
    chainId: chain.id,
    watch: true,
  });

  const { data: sharesBalance, queryKey: sharesBalanceQueryKey } =
    useReadContract({
      address: vault.alchemist.address,
      chainId: chain.id,
      abi: alchemistV2Abi,
      functionName: "positions",
      args: [address!, vault.yieldToken],
      query: {
        enabled: !!address,
        select: ([shares]) =>
          formatUnits(shares, vault.yieldTokenParams.decimals),
      },
    });

  useEffect(() => {
    if (blockNumber) {
      queryClient.invalidateQueries({ queryKey: sharesBalanceQueryKey });
    }
  }, [blockNumber, queryClient, sharesBalanceQueryKey]);

  const setMax = () => {
    if (sharesBalance) {
      setAmount(sharesBalance);
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
        Balance: {formatNumber(sharesBalance)} SHARE
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
