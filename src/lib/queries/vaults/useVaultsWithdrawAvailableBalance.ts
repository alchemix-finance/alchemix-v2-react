import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { formatEther, formatUnits, parseUnits } from "viem";

import { useChain } from "@/hooks/useChain";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { ScopeKeys } from "@/lib/queries/queriesSchema";
import { useStaticTokenAdapterWithdraw } from "@/hooks/useStaticTokenAdapterWithdraw";
import { Vault } from "@/lib/types";

interface UseVaultsWithdrawAvailableBalanceArgs {
  vault: Vault;
  isSelectedTokenYieldToken: boolean;
}

export const useVaultsWithdrawAvailableBalance = ({
  vault,
  isSelectedTokenYieldToken,
}: UseVaultsWithdrawAvailableBalanceArgs) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: debitCreditSharesBalances } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: vault.alchemist.address,
        chainId: chain.id,
        abi: alchemistV2Abi,
        functionName: "accounts",
        args: [address!],
      },
      {
        address: vault.alchemist.address,
        chainId: chain.id,
        abi: alchemistV2Abi,
        functionName: "totalValue",
        args: [address!],
      },
      {
        address: vault.alchemist.address,
        chainId: chain.id,
        abi: alchemistV2Abi,
        functionName: "positions",
        args: [address!, vault.yieldToken],
      },
    ] as const,
    scopeKey: ScopeKeys.VaultWithdrawInput,
    query: {
      enabled: !!address,
      select: ([[debt], totalValue, [sharesBalance]]) => [
        debt,
        totalValue,
        sharesBalance,
      ],
    },
  });
  const [debt, totalCollateralInDebtToken, sharesBalance] =
    debitCreditSharesBalances ?? [];

  const { data: underlyingTokenCollateral } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertSharesToUnderlyingTokens",
    args: [vault.yieldToken, sharesBalance ?? 0n],
    query: {
      enabled: sharesBalance !== undefined,
    },
  });

  const { data: collateralInDebtToken } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "normalizeUnderlyingTokensToDebt",
    args: [vault.underlyingToken, underlyingTokenCollateral ?? 0n],
    query: {
      enabled: underlyingTokenCollateral !== undefined,
    },
  });

  const balanceInDebt = (() => {
    if (
      debt === undefined ||
      totalCollateralInDebtToken === undefined ||
      collateralInDebtToken === undefined
    ) {
      return 0n;
    }

    const requiredCoverInDebt =
      debt * BigInt(formatEther(vault.alchemist.minimumCollateralization));

    const maxWithdrawAmount = totalCollateralInDebtToken - requiredCoverInDebt;

    const otherCoverInDebt = totalCollateralInDebtToken - collateralInDebtToken;

    if (otherCoverInDebt >= requiredCoverInDebt) {
      return collateralInDebtToken;
    } else {
      return maxWithdrawAmount;
    }
  })();

  const { data: balanceForUnderlying } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "normalizeDebtTokensToUnderlying",
    args: [vault.underlyingToken, balanceInDebt],
    query: {
      select: (balance) =>
        formatUnits(balance, vault.underlyingTokensParams.decimals),
    },
  });

  const { data: balanceForYieldToken } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertUnderlyingTokensToYield",
    args: [
      vault.yieldToken,
      parseUnits(
        balanceForUnderlying ?? "0",
        vault.underlyingTokensParams.decimals,
      ),
    ],
    query: {
      enabled: balanceForUnderlying !== undefined,
      select: (balance) =>
        formatUnits(balance, vault.yieldTokenParams.decimals),
    },
  });

  const { balanceForYieldTokenAdapter } = useStaticTokenAdapterWithdraw({
    typeGuard: "withdrawInput",
    balanceForYieldToken,
    isSelectedTokenYieldToken,
    vault,
  });

  /**
   * NOTE: Watch queries for changes in sharesBalance, totalCollateral.
   * sharesBalance - if user deposited or withdrawed from vault for yield token;
   * totalCollateralInDebtToken - if user deposited or withdrawed from vault for yield token;
   */
  useWatchQuery({
    scopeKey: ScopeKeys.VaultWithdrawInput,
  });

  const balance = isSelectedTokenYieldToken
    ? vault.metadata.api.provider === "aave" &&
      vault.metadata.yieldTokenOverride
      ? balanceForYieldTokenAdapter
      : balanceForYieldToken
    : balanceForUnderlying;

  return { balance };
};
