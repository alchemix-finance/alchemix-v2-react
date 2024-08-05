import { useAccount, useReadContract } from "wagmi";
import { useChain } from "@/hooks/useChain";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { formatEther, formatUnits, parseUnits, zeroAddress } from "viem";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { useMemo } from "react";
import { TokenInput } from "./TokenInput";
import { staticTokenAdapterAbi } from "@/abi/staticTokenAdapter";

export const VaultWithdrawTokenInput = ({
  amount,
  setAmount,
  tokenSymbol,
  tokenDecimals,
  vault,
  isSelectedTokenYieldToken,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  tokenSymbol: string;
  tokenDecimals: number;
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

  const {
    data: totalCollateralInDebtToken,
    queryKey: totalCollateralInDebtTokenQueryKey,
  } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "totalValue",
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  useWatchQuery({
    queryKeys: [sharesBalanceQueryKey, totalCollateralInDebtTokenQueryKey],
  });

  const otherCoverInDebt =
    totalCollateralInDebtToken !== undefined &&
    collateralInDebtToken !== undefined
      ? totalCollateralInDebtToken - collateralInDebtToken
      : 0n;
  const balanceInDebt = useMemo(() => {
    if (collateralInDebtToken === undefined) {
      return 0n;
    }
    const requiredCoverInDebt =
      vault.alchemist.position.debt *
      BigInt(formatEther(vault.alchemist.minimumCollateralization));

    const maxWithdrawAmount = collateralInDebtToken - requiredCoverInDebt;

    if (otherCoverInDebt >= requiredCoverInDebt) {
      return collateralInDebtToken;
    } else {
      return maxWithdrawAmount;
    }
  }, [collateralInDebtToken, otherCoverInDebt, vault]);

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

  /**
   * Adjusted for Aave token adapters.
   * So that when withdrawing Aave yield bearing token, you get exactly what you input.
   * Used in conjunction with `dynamicToStaticAmount` read in `useWithdraw.tsx`.
   * It is safe to assume that static adapter has same decimals as yield token (it inherits from it).
   */
  const { data: balanceForYieldTokenAdapter } = useReadContract({
    address: vault.yieldToken,
    chainId: chain.id,
    abi: staticTokenAdapterAbi,
    functionName: "staticToDynamicAmount",
    args: [
      parseUnits(balanceForYieldToken ?? "0", vault.yieldTokenParams.decimals),
    ],
    query: {
      enabled:
        balanceForYieldToken !== undefined &&
        isSelectedTokenYieldToken &&
        !!vault.metadata.yieldTokenOverride,
      select: (balance) =>
        formatUnits(balance, vault.yieldTokenParams.decimals),
    },
  });

  const balance = isSelectedTokenYieldToken
    ? vault.metadata.yieldTokenOverride
      ? balanceForYieldTokenAdapter
      : balanceForYieldToken
    : balanceForUnderlying;

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
