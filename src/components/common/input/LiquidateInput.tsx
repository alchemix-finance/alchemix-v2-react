import { formatUnits, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useChain } from "@/hooks/useChain";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { TokenInput } from "./TokenInput";
import { ScopeKeys } from "@/lib/queries/queriesSchema";

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

  const { data: maximumShares } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertUnderlyingTokensToShares",
    args: [vault.yieldToken, normalizedDebtToUnderlying ?? 0n],
    scopeKey: ScopeKeys.LiquidateInput,
    query: {
      enabled: normalizedDebtToUnderlying !== undefined,
    },
  });

  const { data: debtInYield } = useReadContract({
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

  const { data: sharesBalance } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "positions",
    args: [address ?? zeroAddress, vault.yieldToken],
    scopeKey: ScopeKeys.LiquidateInput,
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
    args: [vault.yieldToken, sharesBalance ?? 0n],
    scopeKey: ScopeKeys.LiquidateInput,
    query: {
      enabled: sharesBalance !== undefined,
      select: (balance) =>
        formatUnits(balance, vault.yieldTokenParams.decimals),
    },
  });

  /**
   * NOTE: Watch queries for changes in maximumShares, sharesBalance, and balance.
   * maximumShares - because underlying tokens to shares uses price which changes each block;
   * sharesBalance - if user deposited or withdrawed from vault for yield token;
   * balance - because shares to yield token uses price which changes each block.
   */
  useWatchQuery({
    scopeKey: ScopeKeys.LiquidateInput,
  });

  const externalMaximumAmount =
    debtInYield !== undefined &&
    balance !== undefined &&
    +debtInYield < +balance
      ? debtInYield
      : undefined;

  return (
    <TokenInput
      tokenAddress={zeroAddress}
      tokenDecimals={tokenDecimals}
      amount={amount}
      setAmount={setAmount}
      tokenSymbol={tokenSymbol}
      type="Available"
      overrideBalance={balance}
      externalMaximumAmount={externalMaximumAmount}
      dustToZero={true}
    />
  );
};
