import { formatUnits, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useChain } from "@/hooks/useChain";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { TokenInput } from "./TokenInput";

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

  useWatchQuery({
    queryKey: sharesBalanceQueryKey,
  });

  return (
    <TokenInput
      tokenAddress={zeroAddress}
      tokenSymbol="SHARE"
      amount={amount}
      setAmount={setAmount}
      tokenDecimals={18}
      overrideBalance={sharesBalance}
      dustToZero={true}
    />
  );
};
