import { useSwitchChain } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import { zeroAddress } from "viem";

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
import { useAllowance } from "@/hooks/useAllowance";
import { formatNumber } from "@/utils/number";
import {
  useConnextRelayerFee,
  useConnextAmountOut,
  chainIdToDomainMapping,
  bridgeChains,
  chainToAvailableTokensMapping,
  SupportedBridgeChainIds,
  useConnextWriteBridge,
} from "./lib/connext";
import {
  getInitialOriginTokenAddresses,
  getIsConnectedChainNotSupportedForBridge,
  getOriginDomain,
  getSpender,
} from "./lib/utils";
import { StatusBox } from "./StatusBox";

export const ConnextBridgeWidget = () => {
  const chain = useChain();
  const { switchChain } = useSwitchChain();

  const [originChainId, setOriginChainId] = useState(chain.id);
  const originDomain = getOriginDomain(originChainId);
  const originChain = bridgeChains.find((c) => c.id === originChainId);

  const [destinationChainId, setDestinationChainId] = useState(
    bridgeChains.find((c) => c.id !== originChainId)!.id,
  );
  const destinationDomain = chainIdToDomainMapping[destinationChainId];
  const destinationChain = bridgeChains.find(
    (c) => c.id === destinationChainId,
  );

  useEffect(() => {
    const isConnectedChainNotSupportedForBridge =
      getIsConnectedChainNotSupportedForBridge(chain.id);
    if (isConnectedChainNotSupportedForBridge) {
      switchChain({
        chainId: bridgeChains[0].id,
      });
      setOriginChainId(bridgeChains[0].id);
      const newChainTokenAddress =
        chainToAvailableTokensMapping[bridgeChains[0].id][0];
      setOriginTokenAddress(newChainTokenAddress);
      const newDestinationChainId = bridgeChains.find(
        (c) => c.id !== bridgeChains[0].id,
      )?.id;
      if (newDestinationChainId) {
        setDestinationChainId(newDestinationChainId);
      }
    } else if (chain.id !== originChainId) {
      setOriginChainId(chain.id);
      const newChainTokenAddress =
        chainToAvailableTokensMapping[chain.id as SupportedBridgeChainIds][0];
      setOriginTokenAddress(newChainTokenAddress);
      const newDestinationChainId = bridgeChains.find(
        (c) => c.id !== chain.id,
      )?.id;
      if (newDestinationChainId) {
        setDestinationChainId(newDestinationChainId);
      }
    }
  }, [chain.id, originChainId, switchChain]);

  const { data: tokens } = useTokensQuery();
  const [originTokenAddress, setOriginTokenAddress] = useState(
    getInitialOriginTokenAddresses(originChainId)[0],
  );
  const token = tokens?.find(
    (t) => t.address.toLowerCase() === originTokenAddress.toLowerCase(),
  );
  const selection = tokens?.filter((t) =>
    getInitialOriginTokenAddresses(originChainId).includes(t.address),
  );

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const { data: relayerFee } = useConnextRelayerFee({
    originDomain,
    destinationDomain,
  });

  const {
    data: amountOut,
    isFetching: isFetchingAmountOut,
    isError,
  } = useConnextAmountOut({
    originDomain,
    destinationDomain,
    originTokenAddress,
    amount,
  });

  const { isApprovalNeeded, approveConfig, approve } = useAllowance({
    amount,
    tokenAddress: originTokenAddress,
    spender: getSpender({ originChainId }),
    decimals: token?.decimals,
  });

  const {
    mutate: writeBridge,
    data: transactionHash,
    isPending: isWritingBridge,
  } = useConnextWriteBridge();

  const handleOriginChainSelect = useCallback(
    (chainId: string) => {
      const newChainId = Number(chainId) as SupportedBridgeChainIds;

      setOriginChainId(newChainId);
      const newChainTokenAddress = chainToAvailableTokensMapping[newChainId][0];
      setOriginTokenAddress(newChainTokenAddress);
      setAmount("");
      if (newChainId === destinationChainId) {
        const newDestinationChainId = bridgeChains.find(
          (c) => c.id !== newChainId,
        )?.id;
        if (newDestinationChainId) {
          setDestinationChainId(newDestinationChainId);
        }
      }
      switchChain({
        chainId: newChainId,
      });
    },
    [destinationChainId, switchChain],
  );

  const handleDestinationChainSelect = useCallback(
    (chainId: string) => {
      const newChainId = Number(chainId) as SupportedBridgeChainIds;

      setDestinationChainId(newChainId);
      setAmount("");
      if (newChainId === originChainId) {
        const newOriginChainId = bridgeChains.find(
          (c) => c.id !== newChainId,
        )?.id;
        if (newOriginChainId) {
          setOriginChainId(newOriginChainId);
          switchChain({
            chainId: newOriginChainId,
          });
          const newChainTokenAddress =
            chainToAvailableTokensMapping[newOriginChainId][0];
          setOriginTokenAddress(newChainTokenAddress);
        }
      }
    },
    [originChainId, switchChain],
  );

  const onCtaClick = () => {
    if (isApprovalNeeded) {
      approveConfig?.request && approve(approveConfig.request);
      return;
    }

    writeBridge({
      amount,
      destinationDomain,
      originDomain,
      originChainId,
      originTokenAddress,
      slippage,
      relayerFee,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-2">
          <p>Origin chain:</p>
          <Select
            value={originChainId.toString()}
            onValueChange={handleOriginChainSelect}
          >
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
            value={destinationChainId.toString()}
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
            value={formatNumber(relayerFee, {
              decimals: 5,
            })}
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
              isError
                ? "Error"
                : isFetchingAmountOut
                  ? "Loading"
                  : formatNumber(amountOut?.amountReceived, { decimals: 4 })
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
          <SelectTrigger className="h-auto w-24 sm:w-56">
            <SelectValue placeholder="Token" asChild>
              <div className="flex items-center gap-4">
                <img
                  src={`/images/token-icons/${token?.symbol}.svg`}
                  alt={token?.symbol}
                  className="h-12 w-12"
                />
                <span className="hidden text-xl sm:inline">
                  {token?.symbol}
                </span>
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
      <div className="flex w-full flex-col sm:flex-row sm:items-center sm:justify-between">
        <SlippageInput slippage={slippage} setSlippage={setSlippage} />
        <StatusBox transactionHash={transactionHash} />
      </div>
      <Button
        variant="outline"
        width="full"
        disabled={isInputZero(amount) || isWritingBridge}
        onClick={onCtaClick}
      >
        {isApprovalNeeded ? "Approve" : "Bridge"}
      </Button>
    </div>
  );
};
