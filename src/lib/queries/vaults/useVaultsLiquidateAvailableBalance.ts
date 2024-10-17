import { formatUnits, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";

import { alchemistV2Abi } from "@/abi/alchemistV2";
import { ScopeKeys } from "@/lib/queries/queriesSchema";
import { Vault } from "@/lib/types";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { useChain } from "@/hooks/useChain";

export const useVaultsLiquidateAvailableBalance = ({
  vault,
}: {
  vault: Vault | undefined;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: unrealizedDebt } = useReadContract({
    address: vault?.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "accounts",
    args: [address ?? zeroAddress],
    scopeKey: ScopeKeys.LiquidateInput,
    query: {
      enabled: !!address,
      select: ([debt]) => (debt < 0n ? 0n : debt),
    },
  });

  const { data: normalizedDebtToUnderlying } = useReadContract({
    address: vault?.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "normalizeDebtTokensToUnderlying",
    args: [vault?.underlyingToken ?? zeroAddress, unrealizedDebt ?? 0n],
    query: {
      enabled: !!vault?.underlyingToken && unrealizedDebt !== undefined,
    },
  });

  const { data: maximumShares } = useReadContract({
    address: vault?.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertUnderlyingTokensToShares",
    args: [vault?.yieldToken ?? zeroAddress, normalizedDebtToUnderlying ?? 0n],
    query: {
      enabled: !!vault?.yieldToken && normalizedDebtToUnderlying !== undefined,
    },
  });

  const { data: debtInYield } = useReadContract({
    address: vault?.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertSharesToYieldTokens",
    args: [vault?.yieldToken ?? zeroAddress, maximumShares ?? 0n],
    query: {
      enabled: !!vault?.yieldToken && maximumShares !== undefined,
      select: (balance) =>
        formatUnits(balance, vault?.yieldTokenParams.decimals ?? 18),
    },
  });

  const { data: sharesBalance } = useReadContract({
    address: vault?.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "positions",
    args: [address ?? zeroAddress, vault?.yieldToken ?? zeroAddress],
    scopeKey: ScopeKeys.LiquidateInput,
    query: {
      enabled: !!vault?.yieldToken && !!address,
      select: ([shares]) => shares,
    },
  });

  const { data: balance } = useReadContract({
    address: vault?.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertSharesToYieldTokens",
    args: [vault?.yieldToken ?? zeroAddress, sharesBalance ?? 0n],
    query: {
      enabled: !!vault?.yieldToken && sharesBalance !== undefined,
      select: (balance) =>
        formatUnits(balance, vault?.yieldTokenParams.decimals ?? 18),
    },
  });

  /**
   * NOTE: Watch queries for changes in sharesBalance.
   * sharesBalance - if user deposited or withdrawed from vault for yield token;
   * unrealizedDebt - if user borrowed or repayed from alchemist associated to vault for yield token;
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

  return {
    externalMaximumAmount,
    balance,
  };
};
