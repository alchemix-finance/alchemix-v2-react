import { useReducedMotion, m, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { useAccount, useReadContract, useSwitchChain } from "wagmi";
import { erc20Abi, formatEther, isAddress, zeroAddress } from "viem";
import { toast } from "sonner";

import {
  BridgeQuote,
  SupportedBridgeChainIds,
  bridgeChains,
  chainToAvailableTokensMapping,
  getInitialOriginTokenAddress,
  getInitialOriginTokenAddresses,
  getInitialDestinationChainId,
  getInitialOriginChainId,
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
import { Switch } from "../ui/switch";
import {
  accordionTransition,
  accordionVariants,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export const Bridge = () => {
  const isReducedMotion = useReducedMotion();

  const chain = useChain();
  const { switchChain } = useSwitchChain();

  const [isWormholeWrapModalOpen, setIsWormholeWrapModalOpen] = useState(false);

  const [bridgeTxHash, setBridgeTxHash] = useState<`0x${string}`>();
  const [bridgeTxProvider, setBridgeTxProvider] =
    useState<BridgeQuote["provider"]>();

  const [originChainId, setOriginChainId] = useState(() =>
    getInitialOriginChainId(chain.id),
  );
  const originChain = bridgeChains.find((c) => c.id === originChainId);

  const [destinationChainId, setDestinationChainId] = useState(() =>
    getInitialDestinationChainId(originChainId),
  );
  const destinationChain = bridgeChains.find(
    (c) => c.id === destinationChainId,
  );

  const { data: tokens } = useTokensQuery(originChainId);
  const [originTokenAddress, setOriginTokenAddress] = useState(() =>
    getInitialOriginTokenAddress(originChainId),
  );
  const token = tokens?.find(
    (t) => t.address.toLowerCase() === originTokenAddress.toLowerCase(),
  );
  const selection = tokens?.filter((t) =>
    getInitialOriginTokenAddresses(originChainId).includes(t.address),
  );

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const [isDifferentAddress, setIsDifferentAddress] = useState(false);
  const [receipientAddress, setReceipientAddress] = useState("");
  const [confirmedDifferentAddress, setConfirmedDifferentAddress] =
    useState(false);

  const { address = zeroAddress } = useAccount();
  const { data: overrideBalance } = useReadContract({
    address: originTokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    chainId: originChainId,
    query: {
      select: (balance) => formatEther(balance),
    },
  });

  const receipient =
    confirmedDifferentAddress && isAddress(receipientAddress)
      ? receipientAddress
      : address;
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
    receipient,
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
      setAmount("");
      const newChainId = Number(chainId) as SupportedBridgeChainIds;

      switchChain({
        chainId: newChainId,
      });
      setOriginChainId(newChainId);
      const newChainTokenAddress = chainToAvailableTokensMapping[newChainId][0];
      setOriginTokenAddress(newChainTokenAddress);
      if (newChainId === destinationChainId) {
        const newDestinationChainId = bridgeChains.find(
          (c) => c.id !== newChainId,
        )?.id;
        if (newDestinationChainId) {
          setDestinationChainId(newDestinationChainId);
        }
      }
    },
    [destinationChainId, switchChain],
  );

  const handleDestinationChainSelect = useCallback(
    (chainId: string) => {
      setAmount("");
      const newChainId = Number(chainId) as SupportedBridgeChainIds;

      setDestinationChainId(newChainId);
      if (newChainId === originChainId) {
        const newOriginChainId = bridgeChains.find(
          (c) => c.id !== newChainId,
        )?.id;
        if (newOriginChainId) {
          switchChain({
            chainId: newOriginChainId,
          });
          setOriginChainId(newOriginChainId);
          const newChainTokenAddress =
            chainToAvailableTokensMapping[newOriginChainId][0];
          setOriginTokenAddress(newChainTokenAddress);
        }
      }
    },
    [originChainId, switchChain],
  );

  const handleDifferentAddressSwitch = () => {
    setReceipientAddress("");
    setIsDifferentAddress((prev) => !prev);
    setConfirmedDifferentAddress(false);
  };

  const handleClearDifferentAddress = () => {
    setReceipientAddress("");
    setConfirmedDifferentAddress(false);
  };

  const handleConfirmedDifferentAddress = () => {
    if (!isAddress(receipientAddress)) {
      toast.error("Invalid address");
      return;
    }
    setConfirmedDifferentAddress((prev) => !prev);
  };

  const { isApprovalNeeded, isPending, writeApprove, writeBridge } =
    useWriteBridge({
      amount,
      originTokenAddress,
      originChainId,
      token,
      quote,
      updateBridgeTxHash,
    });

  const onCtaClick = () => {
    if (originChainId !== chain.id) {
      switchChain({
        chainId: originChainId,
      });
      return;
    }

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
              overrideBalance={overrideBalance ?? "0"}
            />
          </div>
          <div className="flex w-full flex-col gap-2">
            <SlippageInput slippage={slippage} setSlippage={setSlippage} />
            <StatusBox
              transactionHash={bridgeTxHash}
              bridgeProvider={bridgeTxProvider}
            />
          </div>
          <div className="flex items-center">
            <Switch
              checked={isDifferentAddress}
              onCheckedChange={handleDifferentAddressSwitch}
              id="is-different-address"
            />
            <label
              className="cursor-pointer pl-2 text-sm text-lightgrey10inverse dark:text-lightgrey10"
              htmlFor="is-different-address"
            >
              Bridge to different wallet
            </label>
          </div>
          <div>
            <AnimatePresence initial={false}>
              {isDifferentAddress && (
                <m.div
                  key="differentAddressInput"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={
                    isReducedMotion
                      ? reducedMotionAccordionVariants
                      : accordionVariants
                  }
                  transition={accordionTransition}
                  className="space-y-4"
                >
                  <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
                    <Input
                      readOnly={confirmedDifferentAddress}
                      type="text"
                      value={receipientAddress}
                      onChange={(e) => setReceipientAddress(e.target.value)}
                      className="relative h-full flex-grow rounded-none p-4 text-right text-sm"
                      placeholder="0x..."
                    />
                    <Button
                      variant="action"
                      weight="normal"
                      className="flex h-auto border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100 dark:bg-grey3 dark:text-lightgrey10 dark:hover:bg-grey1"
                      onClick={handleClearDifferentAddress}
                    >
                      CLEAR
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      checked={confirmedDifferentAddress}
                      onCheckedChange={handleConfirmedDifferentAddress}
                      id="confirmed-different-address"
                    />
                    <label
                      className="cursor-pointer pl-2 text-sm text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="confirmed-different-address"
                    >
                      I have verified the above address
                    </label>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <CtaButton
            variant="outline"
            width="full"
            disabled={
              !quote ||
              isInputZero(amount) ||
              isPending ||
              (isDifferentAddress && !isAddress(receipientAddress)) ||
              (isDifferentAddress && !confirmedDifferentAddress)
            }
            onClick={onCtaClick}
          >
            {chain.id !== originChainId
              ? "Switch chain"
              : quote?.isWrapNeeded
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
              originTokenAddress={originTokenAddress}
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
