import { zeroAddress } from "viem";

import { TokenInput } from "./TokenInput";

import { Vault } from "@/lib/types";
import { useVaultsLiquidateAvailableBalance } from "@/lib/queries/vaults/useVaultsLiquidateAvailableBalance";

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
  const { balance, externalMaximumAmount } = useVaultsLiquidateAvailableBalance(
    { vault },
  );

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
