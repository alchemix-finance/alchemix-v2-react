import { Token } from "@/lib/types";
import {
  erc20Abi,
  formatEther,
  formatUnits,
  parseEther,
  zeroAddress,
} from "viem";
import { TokenInput } from "./TokenInput";
import { useAccount, useReadContract } from "wagmi";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";

export const RepayInput = ({
  amount,
  setAmount,
  repaymentToken,
  alchemistAddress,
  isSelectedSynthAsset,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  repaymentToken: Token;
  alchemistAddress: `0x${string}`;
  isSelectedSynthAsset: boolean;
}) => {
  const { address = zeroAddress } = useAccount();

  const {
    data: repaymentTokenBalance,
    queryKey: repaymentTokenBalanceQueryKey,
  } = useReadContract({
    address: repaymentToken.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    query: {
      select: (balance) => formatUnits(balance, repaymentToken.decimals),
    },
  });

  const { data: debtBalance, queryKey: debtQueryKey } = useReadContract({
    address: alchemistAddress,
    abi: alchemistV2Abi,
    functionName: "accounts",
    args: [address],
    query: {
      select: (account) => (account[0] < 0n ? "0" : formatEther(account[0])),
    },
  });

  const { data: debtInUnderlying } = useReadContract({
    address: alchemistAddress,
    abi: alchemistV2Abi,
    functionName: "normalizeDebtTokensToUnderlying",
    args: [repaymentToken.address, parseEther(debtBalance ?? "0")],
    query: {
      enabled: debtBalance !== undefined && !isSelectedSynthAsset,
      select: (debtInUnderlying) =>
        formatUnits(debtInUnderlying, repaymentToken.decimals),
    },
  });

  useWatchQuery({
    queryKeys: [repaymentTokenBalanceQueryKey, debtQueryKey],
  });

  const debt = isSelectedSynthAsset ? debtBalance : debtInUnderlying;
  const overrideBalance =
    !!debt && !!repaymentTokenBalance && +debt < +repaymentTokenBalance
      ? debt
      : undefined;

  return (
    <TokenInput
      amount={amount}
      setAmount={setAmount}
      tokenAddress={repaymentToken.address}
      tokenDecimals={repaymentToken.decimals}
      tokenSymbol={repaymentToken.symbol}
      type="Available"
      overrideBalance={overrideBalance}
    />
  );
};
