import { useReducedMotion, m, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";
import { useAccount, useReadContract, useSwitchChain } from "wagmi";
import { erc20Abi, formatEther, isAddress, zeroAddress } from "viem";
import { toast } from "sonner";

import { useChain } from "@/hooks/useChain";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TokenInput } from "@/components/common/input/TokenInput";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { CtaButton } from "@/components/common/CtaButton";
import { isInputZero } from "@/utils/inputNotZero";
import { Switch } from "@/components/ui/switch";
import { reducedMotionAccordionVariants } from "@/lib/motion/motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BridgeWrapModal } from "@/components/modals/bridgeWrap/BridgeWrapModal";

import {
  SupportedBridgeChainIds,
  bridgeChains,
  chainToAvailableTokensMapping,
  getInitialOriginTokenAddress,
  getInitialOriginTokenAddresses,
  getInitialDestinationChainId,
  getInitialOriginChainId,
} from "./lib/constants";
import { StatusBox } from "./StatusBox";
import { BridgeQuoter } from "./BridgeQuoter";
import { useWriteBridge } from "./lib/mutations";
import { useBridgeQuote } from "./lib/queries";

export const Bridge = () => {
  const isReducedMotion = useReducedMotion();

  const chain = useChain();
  const { switchChain } = useSwitchChain();

  const [isWrapModalOpen, setIsWrapModalOpen] = useState(false);

  const [bridgeTxHash, setBridgeTxHash] = useState<`0x${string}`>();

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
    data: quote,
    isLoading,
    isError,
  } = useBridgeQuote({
    originChainId,
    destinationChainId,
    originTokenAddress,
    amount,
    receipient,
  });

  const updateBridgeTxHash = useCallback((hash: `0x${string}`) => {
    setBridgeTxHash(hash);
    setAmount("");
  }, []);

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
      setIsWrapModalOpen(true);
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
      <div className="flex flex-col justify-center gap-4 xl:flex-row xl:gap-10">
        <m.div
          layout={!isReducedMotion}
          transition={{ type: "spring", duration: 0.25, bounce: 0 }}
          className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 relative space-y-4 rounded-md border p-5 xl:max-w-lg"
        >
          <m.div
            layout={!isReducedMotion}
            className="flex flex-wrap items-center justify-between gap-2"
          >
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
          </m.div>
          <m.div
            layout={!isReducedMotion}
            className="border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3 flex rounded-sm border"
          >
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
          </m.div>
          <m.div
            layout={!isReducedMotion}
            className="flex w-full flex-col gap-2"
          >
            <StatusBox transactionHash={bridgeTxHash} />
          </m.div>
          <m.div layout={!isReducedMotion} className="flex items-center">
            <Switch
              checked={isDifferentAddress}
              onCheckedChange={handleDifferentAddressSwitch}
              id="is-different-address"
            />
            <label
              className="text-lightgrey10inverse dark:text-lightgrey10 cursor-pointer pl-2 text-sm"
              htmlFor="is-different-address"
            >
              Bridge to different wallet
            </label>
          </m.div>
          <AnimatePresence initial={false} mode="popLayout">
            {isDifferentAddress && (
              <m.div
                layout={!isReducedMotion}
                key="differentAddressInput"
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={
                  isReducedMotion
                    ? reducedMotionAccordionVariants
                    : {
                        collapsed: { opacity: 0, y: -10 },
                        open: { opacity: 1, y: 0 },
                      }
                }
                transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                className="space-y-4"
              >
                <div className="border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3 flex rounded-sm border">
                  <Input
                    readOnly={confirmedDifferentAddress}
                    type="text"
                    value={receipientAddress}
                    onChange={(e) => setReceipientAddress(e.target.value)}
                    className="relative h-full grow rounded-none p-4 text-right text-sm"
                    placeholder="0x..."
                  />
                  <Button
                    variant="action"
                    weight="normal"
                    className="bg-grey3inverse text-lightgrey10inverse/80 hover:bg-grey1inverse hover:text-lightgrey10inverse dark:hover:text-lightgrey10 dark:bg-grey3 dark:text-lightgrey10/80 dark:hover:bg-grey1 flex h-auto border-0 transition-all"
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
                    className="text-lightgrey10inverse dark:text-lightgrey10 cursor-pointer pl-2 text-sm"
                    htmlFor="confirmed-different-address"
                  >
                    I have verified the above address
                  </label>
                </div>
              </m.div>
            )}
          </AnimatePresence>
          <m.div
            layout={isReducedMotion ? false : "position"}
            transition={{ type: "easeInOut", duration: 0.25 }}
          >
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
        </m.div>
        <AnimatePresence initial={false} mode="popLayout">
          {(!!quote || isLoading || isError) && (
            <BridgeQuoter
              key="BridgeQuoter"
              quote={quote}
              isLoading={isLoading}
              isError={isError}
              originTokenSymbol={token?.symbol}
            />
          )}
        </AnimatePresence>
      </div>

      <BridgeWrapModal
        open={isWrapModalOpen}
        onOpenChange={setIsWrapModalOpen}
        amount={amount}
        bridgeTxHash={bridgeTxHash}
        updateBridgeTxHash={updateBridgeTxHash}
        originChainId={originChainId}
        destinationChainName={destinationChain?.name}
        originTokenAddress={originTokenAddress}
        originTokenSymbol={token?.symbol}
        quote={quote}
      />
    </>
  );
};
