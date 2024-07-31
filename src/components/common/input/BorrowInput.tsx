import { Token } from "@/lib/types";
import { useVaults } from "@/lib/queries/useVaults";
import { formatEther, zeroAddress } from "viem";
import { TokenInput } from "./TokenInput";
import { useAccount, useReadContract } from "wagmi";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";

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

  const vaultForAlchemist = vaults?.find(
    (vault) =>
      vault.alchemist.debtToken.toLowerCase() ===
      debtToken.address.toLowerCase(),
  );

  const { address = zeroAddress } = useAccount();

  const {
    data: totalValueOfCollateralInDebtTokens,
    queryKey: totalValueQueryKey,
  } = useReadContract({
    address: vaultForAlchemist?.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "totalValue",
    args: [address],
    query: {
      enabled: !!vaultForAlchemist,
    },
  });

  const { data: debt, queryKey: accountsQueryKey } = useReadContract({
    address: vaultForAlchemist?.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "accounts",
    args: [address],
    query: {
      enabled: !!vaultForAlchemist,
      select: (accounts) => (accounts[0] > 0n ? accounts[0] : 0n),
    },
  });

  const availableCredit =
    totalValueOfCollateralInDebtTokens !== undefined &&
    vaultForAlchemist !== undefined &&
    debt !== undefined
      ? totalValueOfCollateralInDebtTokens /
          BigInt(
            formatEther(vaultForAlchemist?.alchemist.minimumCollateralization),
          ) -
        debt
      : 0n;

  const overrideBalance = formatEther(
    availableCredit > 0n ? availableCredit : 0n,
  );

  useWatchQuery({
    queryKeys: [totalValueQueryKey, accountsQueryKey],
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
    />
  );
};
