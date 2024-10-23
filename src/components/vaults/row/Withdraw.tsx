import { useState } from "react";
import { formatEther } from "viem";

import { Token, Vault } from "@/lib/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SlippageInput } from "@/components/common/input/SlippageInput";
import { CtaButton } from "@/components/common/CtaButton";
import { VaultWithdrawTokenInput } from "@/components/common/input/VaultWithdrawTokenInput";
import { VaultActionMotionDiv } from "./motion";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { GAS_ADDRESS } from "@/lib/constants";
import { useWithdraw } from "@/lib/mutations/useWithdraw";
import { useVaultsWithdrawAvailableBalance } from "@/lib/queries/vaults/useVaultsWithdrawAvailableBalance";
import { isInputZero } from "@/utils/inputNotZero";
import { formatNumber } from "@/utils/number";
import { getTokenLogoUrl } from "@/utils/getTokenLogoUrl";

export const Withdraw = ({
  vault,
  underlyingTokenData,
  yieldTokenData,
}: {
  vault: Vault;
  underlyingTokenData: Token;
  yieldTokenData: Token;
}) => {
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const initTokenAddress = vault.metadata.disabledWithdrawTokens
    .map((t) => t.toLowerCase())
    .includes(underlyingTokenData.address.toLowerCase())
    ? yieldTokenData.address
    : underlyingTokenData.address;
  const [tokenAddress, setTokenAddress] = useState(initTokenAddress);

  const { data: tokens } = useTokensQuery();
  const gasToken = tokens?.find((token) => token.address === GAS_ADDRESS);

  const isETHCompatible =
    vault.metadata.wethGateway !== undefined && gasToken !== undefined;
  const selection = [
    ...(isETHCompatible
      ? [underlyingTokenData, yieldTokenData, gasToken]
      : [underlyingTokenData, yieldTokenData]),
  ].filter(
    (t) =>
      !vault.metadata.disabledWithdrawTokens
        .map((t) => t.toLowerCase())
        .includes(t.address.toLowerCase()),
  );

  const token = selection.find((token) => token.address === tokenAddress)!;

  const isSelectedTokenYieldToken =
    token.address.toLowerCase() === yieldTokenData.address.toLowerCase();

  const { isApprovalNeeded, writeApprove, writeWithdraw, isPending } =
    useWithdraw({
      vault,
      selectedToken: token,
      amount,
      slippage,
      yieldToken: yieldTokenData,
      setAmount,
      isSelectedTokenYieldToken,
    });

  const onCtaClick = () => {
    if (isApprovalNeeded === true) {
      writeApprove();
    } else {
      writeWithdraw();
    }
  };

  const onSelectChange = (value: string) => {
    setAmount("");
    setTokenAddress(value as `0x${string}`);
  };

  const { balance } = useVaultsWithdrawAvailableBalance({
    vault,
    isSelectedTokenYieldToken,
  });

  const isInsufficientBalance = balance !== undefined && +amount > +balance;
  const isDisabledCta =
    isPending || isInputZero(amount) || isInsufficientBalance;

  return (
    <VaultActionMotionDiv>
      <div className="space-y-4">
        <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
          <Select value={tokenAddress} onValueChange={onSelectChange}>
            <SelectTrigger className="h-auto w-24 sm:w-56">
              <SelectValue placeholder="Token" asChild>
                <div className="flex items-center gap-4">
                  <img
                    src={getTokenLogoUrl(token.symbol)}
                    alt={token.symbol}
                    className="h-12 w-12"
                  />
                  <span className="hidden text-xl sm:inline">
                    {token.symbol}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {selection.map((token) => (
                <SelectItem key={token.address} value={token.address}>
                  {token.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <VaultWithdrawTokenInput
            amount={amount}
            setAmount={setAmount}
            tokenSymbol={token.symbol}
            tokenDecimals={token.decimals}
            isSelectedTokenYieldToken={isSelectedTokenYieldToken}
            vault={vault}
          />
        </div>
        {!isSelectedTokenYieldToken && (
          <SlippageInput slippage={slippage} setSlippage={setSlippage} />
        )}
        <p className="text-sm text-lightgrey10inverse dark:text-lightgrey10">
          Current debt:{" "}
          {formatNumber(
            formatEther(
              vault.alchemist.position.debt < 0n
                ? 0n
                : vault.alchemist.position.debt,
            ),
            { decimals: 4 },
          )}{" "}
          {vault.alchemist.synthType}
        </p>
        <CtaButton
          variant="outline"
          width="full"
          disabled={isDisabledCta}
          onClick={onCtaClick}
        >
          {isInsufficientBalance
            ? "Insufficient balance"
            : isPending
              ? "Preparing"
              : isApprovalNeeded === true
                ? "Approve"
                : "Withdraw"}
        </CtaButton>
      </div>
    </VaultActionMotionDiv>
  );
};
