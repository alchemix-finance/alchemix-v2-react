import { useAccount, useReadContract } from "wagmi";
import { useChain } from "@/hooks/useChain";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { formatEther, formatUnits, parseUnits, zeroAddress } from "viem";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { useMemo } from "react";
import { TokenInput } from "./TokenInput";
import { useStaticTokenAdapterWithdraw } from "@/hooks/useStaticTokenAdapterWithdraw";

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

  const { balanceForYieldTokenAdapter } = useStaticTokenAdapterWithdraw({
    typeGuard: "withdrawInput",
    balanceForYieldToken,
    isSelectedTokenYieldToken,
    vault,
  });

  const balance = isSelectedTokenYieldToken
    ? vault.metadata.api.provider === "aave" &&
      vault.metadata.yieldTokenOverride
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
      dustToZero={true}
    />
  );
};
