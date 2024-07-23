import { Token, Vault } from "@/lib/types";
import { TokenInput } from "@/components/common/input/TokenInput";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatUnits } from "viem";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { GAS_ADDRESS } from "@/lib/constants";
import { useDeposit } from "@/lib/mutations/useDeposit";
import { isInputZero } from "@/utils/inputNotZero";
import { useReadContract } from "wagmi";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useChain } from "@/hooks/useChain";
import { SlippageInput } from "@/components/common/input/SlippageInput";

export const Deposit = ({
  vault,
  underlyingTokenData,
  yieldTokenData,
}: {
  vault: Vault;
  underlyingTokenData: Token;
  yieldTokenData: Token;
}) => {
  const chain = useChain();

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("2");
  const [tokenAddress, setTokenAddress] = useState<`0x${string}`>(
    underlyingTokenData.address,
  );

  const { data: tokens } = useTokensQuery();
  const gasToken = useMemo(() => {
    return tokens?.find((token) => token.address === GAS_ADDRESS);
  }, [tokens]);

  const { data: currentValue } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertSharesToUnderlyingTokens",
    args: [vault.yieldToken, vault.yieldTokenParams.totalShares],
    query: {
      select: (value) => formatUnits(value, yieldTokenData.decimals),
    },
  });

  const limitValue = formatUnits(
    vault.yieldTokenParams.maximumExpectedValue,
    yieldTokenData.decimals,
  );

  const isFull =
    (parseInt(currentValue ?? "0") / parseInt(limitValue)) * 100 >= 99;

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
    <div className="space-y-4">
      <div className="flex rounded border border-grey3inverse bg-grey3inverse">
        <Select
          value={tokenAddress}
          onValueChange={(value) => setTokenAddress(value as `0x${string}`)}
        >
          <SelectTrigger className="h-auto w-56">
            <SelectValue placeholder="Token" asChild>
              <div className="flex items-center gap-4">
                <img
                  src={`/images/token-icons/${token.symbol}.svg`}
                  alt={token.symbol}
                  className="h-12 w-12"
                />
                <span className="text-xl">{token.symbol}</span>
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
        <TokenInput
          amount={amount}
          setAmount={setAmount}
          tokenAddress={token.address}
          tokenSymbol={token.symbol}
          tokenDecimals={token.decimals}
        />
      </div>
      <SlippageInput slippage={slippage} setSlippage={setSlippage} />
      <Button
        variant="outline"
        width="full"
        disabled={isFull || isFetching || isInputZero(amount)}
        onClick={onCtaClick}
      >
        {isFull
          ? "Vault is full"
          : isFetching
            ? "Preparing"
            : token.address !== GAS_ADDRESS && isApprovalNeeded === true
              ? "Approve"
              : "Deposit"}
      </Button>
    </div>
  );
};
