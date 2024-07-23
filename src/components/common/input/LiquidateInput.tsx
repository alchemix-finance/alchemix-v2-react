import { formatUnits, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useChain } from "@/hooks/useChain";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { TokenInput } from "./TokenInput";

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

  return (
    <TokenInput
      tokenAddress={zeroAddress}
      tokenDecimals={18}
      amount={amount}
      setAmount={setAmount}
      tokenSymbol={tokenSymbol}
      type="Available"
      overrideBalance={balance}
    />
  );
};
