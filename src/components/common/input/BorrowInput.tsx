import { formatEther } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { divide } from "dnum";

import { TokenInput } from "./TokenInput";

import { alchemistV2Abi } from "@/abi/alchemistV2";
import { Token } from "@/lib/types";
import { useVaults } from "@/lib/queries/vaults/useVaults";
import { ScopeKeys } from "@/lib/queries/queriesSchema";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { useChain } from "@/hooks/useChain";

export const BorrowInput = ({
  amount,
  setAmount,
  debtToken,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  debtToken: Token;
}) => {
  const chain = useChain();
  const { data: vaults } = useVaults();

  const vaultForAlchemist = vaults?.find(
    (vault) =>
      vault.alchemist.debtToken.toLowerCase() ===
      debtToken.address.toLowerCase(),
  );

  const { address } = useAccount();

  const { data: totalValueOfCollateralInDebtTokens } = useReadContract({
    address: vaultForAlchemist?.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "totalValue",
    args: [address!],
    scopeKey: ScopeKeys.BorrowInput,
    query: {
      enabled: !!vaultForAlchemist && !!address,
    },
  });

  const { data: debt } = useReadContract({
    address: vaultForAlchemist?.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "accounts",
    args: [address!],
    scopeKey: ScopeKeys.BorrowInput,
    query: {
      enabled: !!vaultForAlchemist && !!address,
      select: ([debt]) => debt,
    },
  });

  const availableCredit =
    totalValueOfCollateralInDebtTokens !== undefined &&
    vaultForAlchemist !== undefined &&
    debt !== undefined
      ? divide(
          [totalValueOfCollateralInDebtTokens, 18],
          [vaultForAlchemist.alchemist.minimumCollateralization, 18],
        )[0] - debt
      : 0n;

  // If availableCredit is greater than 0, subtract 1 from it to prevent the user from borrowing the full amount (to avoid failed tx)
  const overrideBalance = formatEther(
    availableCredit > 0n ? availableCredit - 1n : 0n,
  );

  useWatchQuery({
    scopeKey: ScopeKeys.BorrowInput,
  });

  return (
    <TokenInput
      amount={amount}
      setAmount={setAmount}
      tokenAddress={debtToken.address}
      tokenDecimals={debtToken.decimals}
      tokenSymbol={debtToken.symbol}
      type="Available"
      overrideBalance={overrideBalance}
      dustToZero={true}
    />
  );
};
