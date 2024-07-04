import { alchemistV2Abi } from "@/abi/alchemistV2";
import { Vault } from "@/lib/types";
import { useCallback } from "react";
import { usePublicClient } from "wagmi";
import { useChain } from "./useChain";
import { wagmiConfig } from "@/components/providers/Web3Provider";

export const useVaultHelper = (vault: Vault | undefined) => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  const convertUnderlyingTokensToYield = useCallback(
    (amount: bigint) => {
      if (!vault) return 0n;
      const adapter = vault.tokenAdapter;
      const yieldTokenParams = vault.yieldTokenParams;
      return (
        (amount * 10n ** BigInt(yieldTokenParams.decimals)) / adapter.price
      );
    },
    [vault],
  );

  const convertYieldTokensToUnderlying = useCallback(
    (amount: bigint) => {
      if (!vault) return 0n;
      const adapter = vault.tokenAdapter;
      const yieldTokenParams = vault.yieldTokenParams;

      return (
        (amount * adapter.price) / 10n ** BigInt(yieldTokenParams.decimals)
      );
    },
    [vault],
  );

  const calculateUnrealizedActiveBalance = useCallback(() => {
    if (!vault) return 0n;
    const yieldTokenParams = vault.yieldTokenParams;

    if (yieldTokenParams.activeBalance === 0n)
      return yieldTokenParams.activeBalance;

    const currentValue = convertYieldTokensToUnderlying(
      yieldTokenParams.activeBalance,
    );

    const expectedValue = yieldTokenParams.expectedValue;

    if (currentValue <= expectedValue) return yieldTokenParams.activeBalance;

    const harvestable = convertUnderlyingTokensToYield(
      currentValue - expectedValue,
    );

    if (harvestable === 0n) return yieldTokenParams.activeBalance;

    return yieldTokenParams.activeBalance - harvestable;
  }, [convertUnderlyingTokensToYield, convertYieldTokensToUnderlying, vault]);

  const convertSharesToYieldTokens = useCallback(
    (shares: bigint) => {
      if (!vault?.yieldTokenParams.totalShares) return 0n;
      const totalShares = vault.yieldTokenParams.totalShares;
      if (totalShares === 0n) return shares;

      return (shares * calculateUnrealizedActiveBalance()) / totalShares;
    },
    [calculateUnrealizedActiveBalance, vault?.yieldTokenParams.totalShares],
  );
  const convertYieldTokensToShares = useCallback(
    (amount: bigint) => {
      if (!vault?.yieldTokenParams.totalShares) return 0n;
      const totalShares = vault.yieldTokenParams.totalShares;

      if (totalShares === 0n) return amount;

      return (amount * totalShares) / calculateUnrealizedActiveBalance();
    },
    [calculateUnrealizedActiveBalance, vault?.yieldTokenParams.totalShares],
  );

  const convertSharesToUnderlyingTokens = useCallback(
    (shares: bigint) => {
      const amountYieldTokens = convertSharesToYieldTokens(shares);

      return convertYieldTokensToUnderlying(amountYieldTokens);
    },
    [convertSharesToYieldTokens, convertYieldTokensToUnderlying],
  );

  const convertUnderlyingTokensToShares = useCallback(
    (amount: bigint) => {
      const amountYieldTokens = convertUnderlyingTokensToYield(amount);
      return convertYieldTokensToShares(amountYieldTokens);
    },
    [convertUnderlyingTokensToYield, convertYieldTokensToShares],
  );

  const normalizeUnderlyingToDebt = useCallback(
    async (amount: bigint) => {
      if (!vault?.alchemist) return 0n;
      const normalizedValue = await publicClient.readContract({
        address: vault.alchemist.address,
        abi: alchemistV2Abi,
        functionName: "normalizeUnderlyingTokensToDebt",
        args: [vault.underlyingToken, amount],
      });

      return normalizedValue;
    },
    [publicClient, vault?.alchemist, vault?.underlyingToken],
  );

  return {
    convertSharesToYieldTokens,
    convertYieldTokensToShares,
    convertSharesToUnderlyingTokens,
    convertUnderlyingTokensToShares,
    convertYieldTokensToUnderlying,
    convertUnderlyingTokensToYield,
    calculateUnrealizedActiveBalance,
    normalizeUnderlyingToDebt,
  };
};
