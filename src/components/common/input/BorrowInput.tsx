import { useMemo } from "react";
import { Token } from "@/lib/types";
import { useVaults } from "@/lib/queries/useVaults";
import { VaultHelper } from "@/utils/helpers/vaultHelper";
import { formatEther, formatUnits } from "viem";
import { TokenInput } from "./TokenInput";

export const BorrowInput = ({
  amount,
  setAmount,
  debtToken,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  debtToken: Token;
}) => {
  const { data: vaults } = useVaults();

  // TODO: I think we can make this more reactive.
  // E.g. reading all shares via use read contracts.
  // Currently shares get stale after useVaults run.
  // UPDATE THOUGHT: On the other hand we can't expect this to be updated anywhere outside of Alchemix.
  // So it is safe to only update it when alchemists or vaults invalidate.
  // UPDATE THOUGHT: If latter, we can put it in useVaults and keep it in fields accordingly.
  const tokenBalance = useMemo(() => {
    if (!vaults) return;
    const vaultsForDebtToken = vaults.filter(
      (vault) =>
        vault.alchemist.debtToken.toLowerCase() ===
        debtToken.address.toLowerCase(),
    );
    const depositForDebtToken = vaultsForDebtToken.reduce((prev, curr) => {
      const vaultHelper = new VaultHelper(curr);
      const decimals = curr.underlyingTokensParams.decimals;
      const balanceUnderlying = vaultHelper.convertSharesToUnderlyingTokens(
        curr.position.shares,
      );

      const formattedBalance = formatUnits(balanceUnderlying, decimals);

      return prev + +formattedBalance;
    }, 0);

    const ltv = +formatEther(
      vaultsForDebtToken[0].alchemist.minimumCollateralization,
    );
    const debt =
      vaultsForDebtToken[0].alchemist.position.debt > 0n
        ? vaultsForDebtToken[0].alchemist.position.debt
        : 0n;
    const debtFormatted = formatUnits(debt, debtToken.decimals);
    const amountAvailableToBorrow = depositForDebtToken / ltv - +debtFormatted;
    if (amountAvailableToBorrow < 0) return "0";
    // Adjusting for floating point errors
    // TODO: This is a wacky way to fix floating point errors. We should find a better way.
    const adjusted = +amountAvailableToBorrow.toFixed(6) - 0.000001;
    if (adjusted < 0) return "0";
    return adjusted.toString();
  }, [debtToken, vaults]);

  return (
    <TokenInput
      amount={amount}
      setAmount={setAmount}
      tokenAddress={debtToken.address}
      tokenDecimals={debtToken.decimals}
      tokenSymbol={debtToken.symbol}
      type="Available"
      overrideBalance={tokenBalance}
    />
  );
};
