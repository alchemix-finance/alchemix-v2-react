import { useSwitchChain } from "wagmi";
import { useCallback, useState } from "react";
import { isAddress, zeroAddress } from "viem";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TokenInput } from "@/components/common/input/TokenInput";
import { SlippageInput } from "@/components/common/input/SlippageInput";
import { Button } from "@/components/ui/button";
import { isInputZero } from "@/utils/inputNotZero";
import { useChain } from "@/hooks/useChain";
import { formatNumber } from "@/utils/number";
import {
  useConnextRelayerFee,
  useConnextAmountOut,
  useConnextApproval,
  useConnextWriteApprove,
  useConnextWriteBridge,
  chainIdToDomainMapping,
  bridgeChains,
  chainToAvailableTokensMapping,
} from "./lib/connext";

export const ConnextBridgeWidget = () => {
  const chain = useChain();

  const [originChainId, setOriginChainId] = useState(chain.id.toString());
  const originDomain = chainIdToDomainMapping[originChainId];
  const originChain = bridgeChains.find(
    (c) => c.id.toString() === originChainId,
  );

  const [destinationChainId, setDestinationChainId] = useState(
    bridgeChains.find((c) => c.id.toString() !== originChainId)!.id.toString(),
  );
  const destinationDomain = chainIdToDomainMapping[destinationChainId];
  const destinationChain = bridgeChains.find(
    (c) => c.id.toString() === destinationChainId,
  );

  const { data: tokens } = useTokensQuery();
  const [originTokenAddress, setOriginTokenAddress] = useState(
    chainToAvailableTokensMapping[originChainId][0],
  );
  const token = tokens?.find(
    (t) => t.address.toLowerCase() === originTokenAddress.toLowerCase(),
  );
  const selection = tokens?.filter((t) =>
    chainToAvailableTokensMapping[originChainId].includes(
      t.address.toLowerCase(),
    ),
  );

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const { data: relayerFee } = useConnextRelayerFee({
    originDomain,
    destinationDomain,
  });

  const { data: amountOut, isFetching: isFetchingAmountOut } =
    useConnextAmountOut({
      originDomain,
      destinationDomain,
      originTokenAddress,
      amount,
    });

  const { data: approveData } = useConnextApproval({
    originDomain,
    originTokenAddress,
    amount,
    originChainId: parseInt(originChainId),
  });

  const notReady =
    isFetchingAmountOut ||
    approveData === undefined ||
    relayerFee === undefined ||
    amountOut === undefined;

  const { mutate: writeApprove, isPending: isApproving } =
    useConnextWriteApprove();
  const { mutate: writeBridge, isPending: isBridging } =
    useConnextWriteBridge();

  const { switchChain } = useSwitchChain();

  const handleOriginChainSelect = useCallback(
    (chainId: string) => {
      setOriginChainId(chainId);
      const newChainTokenAddress = chainToAvailableTokensMapping[chainId][0];
      if (isAddress(newChainTokenAddress)) {
        setOriginTokenAddress(newChainTokenAddress);
      }
      setAmount("");
      if (chainId === destinationChainId) {
        const newDestinationChainId = bridgeChains
          .find((c) => c.id.toString() !== chainId)
          ?.id.toString();
        if (newDestinationChainId) {
          setDestinationChainId(newDestinationChainId);
        }
      }
      switchChain({
        chainId: Number(chainId),
      });
    },
    [destinationChainId, switchChain],
  );

  const handleDestinationChainSelect = useCallback(
    (chainId: string) => {
      setDestinationChainId(chainId);
      setAmount("");
      if (chainId === originChainId) {
        const newOriginChainId = bridgeChains
          .find((c) => c.id.toString() !== chainId)
          ?.id.toString();
        if (newOriginChainId) {
          setOriginChainId(newOriginChainId);
          switchChain({
            chainId: Number(newOriginChainId),
          });
          const newChainTokenAddress =
            chainToAvailableTokensMapping[newOriginChainId][0];
          if (isAddress(newChainTokenAddress)) {
            setOriginTokenAddress(newChainTokenAddress);
          }
        }
      }
    },
    [originChainId, switchChain],
  );

  const onCtaClick = () => {
    if (!approveData) return;
    if (approveData?.isApprovalNeeded === true) {
      writeApprove({ approveData });
      return;
    }
    if (!relayerFee) return;

    writeBridge({
      originDomain,
      destinationDomain,
      destinationChainId: parseInt(destinationChainId),
      originTokenAddress,
      amount,
      slippage,
      relayerFee,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-2">
          <p>Origin chain:</p>
          <Select value={originChainId} onValueChange={handleOriginChainSelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Origin chain">
                {originChain?.name ?? "Error"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bridgeChains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <p>Target chain:</p>
          <Select
            value={destinationChainId}
            onValueChange={handleDestinationChainSelect}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Target chain">
                {destinationChain?.name ?? "Error"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bridgeChains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <p>Router fee:</p>
          <Input
            value={formatNumber(amountOut?.routerFee)}
            readOnly
            aria-readonly
            type="text"
            className="text-right"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Relayer fee:</p>
          <Input
            value={formatNumber(relayerFee, 5)}
            readOnly
            aria-readonly
            type="text"
            className="text-right"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>You receive:</p>
          <Input
            value={
              isFetchingAmountOut
                ? "Loading"
                : formatNumber(amountOut?.amountReceived)
            }
            readOnly
            aria-readonly
            type="text"
            className="text-right"
          />
        </div>
      </div>
      <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
        <Select
          value={originTokenAddress}
          onValueChange={(value) =>
            setOriginTokenAddress(value as `0x${string}`)
          }
        >
          <SelectTrigger className="h-auto w-56">
            <SelectValue placeholder="Token" asChild>
              <div className="flex items-center gap-4">
                <img
                  src={`/images/token-icons/${token?.symbol}.svg`}
                  alt={token?.symbol}
                  className="h-12 w-12"
                />
                <span className="text-xl">{token?.symbol}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {selection?.map((token) => (
              <SelectItem key={token.address} value={token.address}>
                {token.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TokenInput
          amount={amount}
          setAmount={setAmount}
          tokenAddress={token?.address ?? zeroAddress}
          tokenSymbol={token?.symbol ?? ""}
          tokenDecimals={18}
        />
      </div>
      <SlippageInput slippage={slippage} setSlippage={setSlippage} />
      <Button
        variant="outline"
        width="full"
        disabled={isInputZero(amount) || notReady || isApproving || isBridging}
        onClick={onCtaClick}
      >
        {isApproving || isBridging
          ? "Loading"
          : approveData?.isApprovalNeeded === true
            ? "Approve"
            : "Bridge"}
      </Button>
    </div>
  );
};
