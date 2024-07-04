import { Token, Vault } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { GAS_ADDRESS } from "@/lib/constants";
import { useWithdraw } from "@/lib/mutations/useWithdraw";
import { VaultWithdrawTokenInput } from "@/components/common/input/VaultWithdrawTokenInput";
import { isInputZero } from "@/utils/inputNotZero";

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
  const [slippage, setSlippage] = useState("2");
  const [tokenAddress, setTokenAddress] = useState<`0x${string}`>(
    underlyingTokenData.address,
  );

  const { data: tokens } = useTokensQuery();
  const gasToken = useMemo(() => {
    return tokens?.find((token) => token.address === GAS_ADDRESS);
  }, [tokens]);

  const isETHCompatible =
    vault.metadata.wethGateway !== undefined && gasToken !== undefined;
  const selection = isETHCompatible
    ? [underlyingTokenData, yieldTokenData, gasToken]
    : [underlyingTokenData, yieldTokenData];

  const token = selection.find((token) => token.address === tokenAddress)!;

  const isSelecedTokenYieldToken =
    token.address.toLowerCase() === yieldTokenData.address.toLowerCase();

  const { isApprovalNeeded, writeApprove, writeWithdraw, isFetching } =
    useWithdraw({
      vault,
      selectedToken: token,
      amount,
      slippage,
      yieldToken: yieldTokenData,
      setAmount,
    });

  const onCtaClick = useCallback(() => {
    if (isApprovalNeeded === true) {
      writeApprove();
    } else {
      writeWithdraw();
    }
  }, [isApprovalNeeded, writeApprove, writeWithdraw]);

  const onSelectChange = (value: string) => {
    setAmount("");
    setTokenAddress(value as `0x${string}`);
  };

  return (
    <div className="space-y-2">
      <Select value={tokenAddress} onValueChange={onSelectChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Token">{token.symbol}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {selection.map((token) => (
            <SelectItem key={token?.address} value={token.address}>
              {token.symbol}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <VaultWithdrawTokenInput
        amount={amount}
        setAmount={setAmount}
        tokenSymbol={token.symbol}
        isSelectedTokenYieldToken={isSelecedTokenYieldToken}
        vault={vault}
      />
      <div className="flex items-center">
        <p>Slippage</p>
        <Input
          type="number"
          value={slippage}
          onChange={(e) => setSlippage(e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        disabled={isFetching || isInputZero(amount)}
        onClick={onCtaClick}
      >
        {isFetching
          ? "Wait"
          : isApprovalNeeded === true
            ? "Approve"
            : "Withdraw"}
      </Button>
    </div>
  );
};
