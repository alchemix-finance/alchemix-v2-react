import { Token, Vault } from "@/lib/types";
import { TokenInput } from "@/components/common/input/TokenInput";
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
import { useVaultHelper } from "@/hooks/useVaultHelper";
import { formatUnits } from "viem";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { GAS_ADDRESS } from "@/lib/constants";
import { useDeposit } from "@/lib/mutations/useDeposit";
import { isInputZero } from "@/utils/inputNotZero";

export const Deposit = ({
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

  const { convertSharesToUnderlyingTokens } = useVaultHelper(vault);

  const { currentValue, limitValue } = useMemo(() => {
    const currentValue = formatUnits(
      convertSharesToUnderlyingTokens(vault.yieldTokenParams.totalShares),
      yieldTokenData.decimals,
    );

    const limitValue = formatUnits(
      vault.yieldTokenParams.maximumExpectedValue,
      yieldTokenData.decimals,
    );
    return { currentValue, limitValue };
  }, [convertSharesToUnderlyingTokens, vault, yieldTokenData.decimals]);

  const isFull = (parseInt(currentValue) / parseInt(limitValue)) * 100 >= 99;

  const isETHCompatible =
    vault.metadata.wethGateway !== undefined && gasToken !== undefined;
  const selection = isETHCompatible
    ? [underlyingTokenData, yieldTokenData, gasToken]
    : [underlyingTokenData, yieldTokenData];

  const token = selection.find((token) => token.address === tokenAddress)!;

  const { isApprovalNeeded, writeApprove, writeDeposit, isFetching } =
    useDeposit({
      vault,
      selectedToken: token,
      amount,
      slippage,
      yieldToken: yieldTokenData,
      setAmount,
    });

  const onCtaClick = useCallback(() => {
    if (token.address !== GAS_ADDRESS && isApprovalNeeded === true) {
      writeApprove();
    } else {
      writeDeposit();
    }
  }, [token, isApprovalNeeded, writeApprove, writeDeposit]);

  return (
    <div className="space-y-2">
      <Select
        value={tokenAddress}
        onValueChange={(value) => setTokenAddress(value as `0x${string}`)}
      >
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
      <TokenInput
        amount={amount}
        setAmount={setAmount}
        tokenAddress={token.address}
        tokenSymbol={token.symbol}
        tokenDecimals={token.decimals}
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
        disabled={isFull || isFetching || isInputZero(amount)}
        onClick={onCtaClick}
      >
        {isFull
          ? "Vault is full"
          : isFetching
            ? "Wait"
            : token.address !== GAS_ADDRESS && isApprovalNeeded === true
              ? "Approve"
              : "Deposit"}
      </Button>
    </div>
  );
};
