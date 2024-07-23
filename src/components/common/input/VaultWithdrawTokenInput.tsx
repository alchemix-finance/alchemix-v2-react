import { useAccount, useReadContract } from "wagmi";
import { useChain } from "@/hooks/useChain";
import { Vault } from "@/lib/types";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { formatEther, formatUnits, parseUnits, zeroAddress } from "viem";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { useMemo } from "react";
import { useVaults } from "@/lib/queries/useVaults";
import { VaultHelper } from "@/utils/helpers/vaultHelper";
import { TokenInput } from "./TokenInput";

export const VaultWithdrawTokenInput = ({
  amount,
  setAmount,
  tokenSymbol,
  vault,
  isSelectedTokenYieldToken,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  tokenSymbol: string;
  vault: Vault;
  isSelectedTokenYieldToken: boolean;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: vaults } = useVaults();

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

  useWatchQuery({
    queryKey: sharesBalanceQueryKey,
  });

  const { data: underlyingTokenBalance } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertSharesToUnderlyingTokens",
    args: [vault.yieldToken, sharesBalance ?? 0n],
    query: {
      enabled: sharesBalance !== undefined,
      select: (balance) =>
        formatUnits(balance, vault.underlyingTokensParams.decimals),
    },
  });

  const otherCoverInUnderlying = useMemo(() => {
    if (!vaults || !underlyingTokenBalance) {
      return 0;
    }
    const vaultsForDebtToken = vaults.filter(
      (v) =>
        v.alchemist.debtToken.toLowerCase() ===
        vault.alchemist.debtToken.toLowerCase(),
    );
    const aggregatedDepositAmount = vaultsForDebtToken.reduce((prev, curr) => {
      const vaultHelper = new VaultHelper(curr);
      const balanceUnderlying = vaultHelper.convertSharesToUnderlyingTokens(
        curr.position.shares,
      );

      return prev + balanceUnderlying;
    }, 0n);

    const aggregatedDepositAmountFormatted = formatUnits(
      aggregatedDepositAmount,
      vault.underlyingTokensParams.decimals,
    );

    return +aggregatedDepositAmountFormatted - +underlyingTokenBalance;
  }, [
    underlyingTokenBalance,
    vault.alchemist.debtToken,
    vault.underlyingTokensParams.decimals,
    vaults,
  ]);

  const { data: requiredCoverInUnderlying } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "normalizeDebtTokensToUnderlying",
    args: [
      vault.underlyingToken,
      vault.alchemist.position.debt < 0n ? 0n : vault.alchemist.position.debt,
    ],
    query: {
      select: (requiredCover) => {
        const ltv = BigInt(
          formatEther(vault.alchemist.minimumCollateralization),
        );
        return formatUnits(
          requiredCover * ltv,
          vault.underlyingTokensParams.decimals,
        );
      },
    },
  });

  const balanceForUnderlying = useMemo(() => {
    if (underlyingTokenBalance === undefined) {
      return "0";
    }

    if (
      otherCoverInUnderlying === undefined ||
      requiredCoverInUnderlying === undefined
    ) {
      return "0";
    }

    const maxWithdrawAmount =
      +underlyingTokenBalance - +requiredCoverInUnderlying;

    if (otherCoverInUnderlying >= +requiredCoverInUnderlying) {
      return underlyingTokenBalance;
    } else {
      return maxWithdrawAmount.toFixed(vault.underlyingTokensParams.decimals);
    }
  }, [
    otherCoverInUnderlying,
    requiredCoverInUnderlying,
    underlyingTokenBalance,
    vault.underlyingTokensParams.decimals,
  ]);

  const { data: balanceForYieldToken } = useReadContract({
    address: vault.alchemist.address,
    chainId: chain.id,
    abi: alchemistV2Abi,
    functionName: "convertUnderlyingTokensToYield",
    args: [
      vault.yieldToken,
      parseUnits(balanceForUnderlying, vault.underlyingTokensParams.decimals),
    ],
    query: {
      enabled: balanceForUnderlying !== undefined,
      select: (balance) =>
        formatUnits(balance, vault.yieldTokenParams.decimals),
    },
  });

  const balance = isSelectedTokenYieldToken
    ? balanceForYieldToken
    : balanceForUnderlying;

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
