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
  tokenDecimals,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  vault: Vault;
  tokenSymbol: string;
  tokenDecimals: number;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: unrealizedDebt } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "accounts",
    args: [address ?? zeroAddress],
    query: {
      enabled: !!address,
      select: ([debt]) => (debt < 0n ? 0n : debt),
    },
  });

  const { data: normalizedDebtToUnderlying } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "normalizeDebtTokensToUnderlying",
    args: [vault.underlyingToken, unrealizedDebt ?? 0n],
    query: {
      enabled: unrealizedDebt !== undefined,
    },
  });

  const { data: maximumShares, queryKey: maximumSharesQueryKey } =
    useReadContract({
      address: vault.alchemist.address,
      abi: alchemistV2Abi,
      chainId: chain.id,
      functionName: "convertUnderlyingTokensToShares",
      args: [vault.yieldToken, normalizedDebtToUnderlying ?? 0n],
      query: {
        enabled: normalizedDebtToUnderlying !== undefined,
      },
    });

  const { data: balance } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertSharesToYieldTokens",
    args: [vault.yieldToken, maximumShares ?? 0n],
    query: {
      enabled: maximumShares !== undefined,
      select: (balance) =>
        formatUnits(balance, vault.yieldTokenParams.decimals),
    },
  });

  /**
   * NOTE: We only watch maximum shares query key,
   * because we assume that only `convertUnderlyingTokensToShares` return can change while user is on the page for liquidation.
   * This is because `convertUnderlyingTokensToShares` uses yield token adapter price, which can change.
   */
  useWatchQuery({
    queryKey: maximumSharesQueryKey,
  });

  return (
    <TokenInput
      tokenAddress={zeroAddress}
      tokenDecimals={tokenDecimals}
      amount={amount}
      setAmount={setAmount}
      tokenSymbol={tokenSymbol}
      type="Available"
      overrideBalance={balance}
    />
  );
};
