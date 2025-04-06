import { zeroAddress } from "viem";

import { Vault } from "@/lib/types";
import { useVaultsWithdrawAvailableBalance } from "@/lib/queries/vaults/useVaultsWithdrawAvailableBalance";

import { TokenInput } from "./TokenInput";

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
  const { availableBalance } = useVaultsWithdrawAvailableBalance({
    vault,
    isSelectedTokenYieldToken,
  });

  return (
    <TokenInput
      tokenAddress={zeroAddress}
      tokenDecimals={tokenDecimals}
      amount={amount}
      setAmount={setAmount}
      tokenSymbol={tokenSymbol}
      type="Available"
      overrideBalance={availableBalance}
      dustToZero={true}
    />
  );
};
