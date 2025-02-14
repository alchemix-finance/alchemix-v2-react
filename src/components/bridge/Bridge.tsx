import { useReducedMotion, m, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useSwitchChain } from "wagmi";
import { zeroAddress } from "viem";
import { fantom } from "viem/chains";

import {
  BridgeQuote,
  SupportedBridgeChainIds,
  bridgeChains,
  chainToAvailableTokensMapping,
  getInitialOriginTokenAddress,
  getInitialOriginTokenAddresses,
} from "./lib/constants";
import { useChain } from "@/hooks/useChain";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TokenInput } from "@/components/common/input/TokenInput";
import { WormholeWrapModal } from "@/components/modals/wormholeWrap/WormholeWrapModal";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { StatusBox } from "./StatusBox";
import { CtaButton } from "../common/CtaButton";
import { BridgeQuoter } from "./BridgeQuoter";
import { SlippageInput } from "../common/input/SlippageInput";
import { isInputZero } from "@/utils/inputNotZero";
import { useWriteBridge } from "./lib/mutations";
import { useBridgeQuotes } from "./lib/queries";

export const Bridge = () => {
  const isReducedMotion = useReducedMotion();

  const chain = useChain();
  const { switchChain } = useSwitchChain();

  const [isWormholeWrapModalOpen, setIsWormholeWrapModalOpen] = useState(false);

  const [bridgeTxHash, setBridgeTxHash] = useState<`0x${string}`>();
  const [bridgeTxProvider, setBridgeTxProvider] =
    useState<BridgeQuote["provider"]>();

  const [originChainId, setOriginChainId] = useState(chain.id);
  const originChain = bridgeChains.find((c) => c.id === originChainId);

  const [destinationChainId, setDestinationChainId] = useState(
    bridgeChains.find((c) => c.id !== originChainId)!.id,
  );
  const destinationChain = bridgeChains.find(
    (c) => c.id === destinationChainId,
  );

  useEffect(() => {
    if (chain.id === fantom.id) {
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
      const newChainTokenAddress = chainToAvailableTokensMapping[chain.id][0];
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
  const [originTokenAddress, setOriginTokenAddress] = useState(() =>
    getInitialOriginTokenAddress(chain.id),
  );
  const token = tokens?.find(
    (t) => t.address.toLowerCase() === originTokenAddress.toLowerCase(),
  );
  const selection = tokens?.filter((t) =>
    getInitialOriginTokenAddresses(originChainId).includes(t.address),
  );

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const {
    quotes,
    quote,
    setSelectedQuoteProvider,
    showQuotes,
    selectedQuoteProvider,
  } = useBridgeQuotes({
    originChainId,
    destinationChainId,
    originTokenAddress,
    amount,
    slippage,
  });

  const updateBridgeTxHash = useCallback(
    (hash: `0x${string}`) => {
      setBridgeTxHash(hash);
      setBridgeTxProvider(selectedQuoteProvider);
      setAmount("");
    },
    [selectedQuoteProvider],
  );

  const updateQuote = useCallback(
    (quote: BridgeQuote | undefined) => {
      setSelectedQuoteProvider(quote?.provider);
    },
    [setSelectedQuoteProvider],
  );

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

  const { isApprovalNeeded, isPending, writeApprove, writeBridge } =
    useWriteBridge({
      amount,
      originTokenAddress,
      token,
      quote,
      updateBridgeTxHash,
    });

  const onCtaClick = () => {
    if (!quote) {
      return;
    }

    if (quote.isWrapNeeded) {
      setIsWormholeWrapModalOpen(true);
      return;
    }

    if (isApprovalNeeded) {
      writeApprove();
      return;
    }

    writeBridge();
  };

  return (
    <>
      <div className="flex flex-col justify-center gap-10 md:flex-row">
        <m.div
          layout={!isReducedMotion}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className="relative space-y-4 rounded-md border border-grey10inverse bg-grey15inverse p-5 dark:border-grey10 dark:bg-grey15"
        >
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
          <div className="flex w-full flex-col gap-2">
            <SlippageInput slippage={slippage} setSlippage={setSlippage} />
            <StatusBox
              transactionHash={bridgeTxHash}
              bridgeProvider={bridgeTxProvider}
            />
          </div>
          <CtaButton
            variant="outline"
            width="full"
            disabled={!quote || isInputZero(amount) || isPending}
            onClick={onCtaClick}
          >
            {quote?.isWrapNeeded
              ? "Bridge "
              : isPending
                ? "Preparing"
                : isApprovalNeeded === true
                  ? "Approve"
                  : "Bridge"}
          </CtaButton>
        </m.div>
        <AnimatePresence mode="popLayout">
          {showQuotes && (
            <BridgeQuoter
              key="BridgeQuoter"
              selectedQuoteProvider={quote?.provider}
              quotes={quotes}
              originTokenSymbol={token?.symbol}
              updateQuote={updateQuote}
            />
          )}
        </AnimatePresence>
      </div>

      {quote?.provider === "Wormhole" && (
        <WormholeWrapModal
          open={isWormholeWrapModalOpen}
          onOpenChange={setIsWormholeWrapModalOpen}
          amount={amount}
          bridgeTxHash={bridgeTxHash}
          updateBridgeTxHash={updateBridgeTxHash}
          originChainId={originChainId}
          destinationChainId={destinationChainId}
          destinationChainName={destinationChain?.name}
          originTokenAddress={originTokenAddress}
          originTokenSymbol={token?.symbol}
          bridgeCost={quote.bridgeCost}
        />
      )}
    </>
  );
};
