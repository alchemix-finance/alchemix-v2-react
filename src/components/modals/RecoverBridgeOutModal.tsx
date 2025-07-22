import { useCallback, useState } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { isAddress, zeroAddress } from "viem";
import { mainnet } from "viem/chains";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  SupportedBridgeChainIds,
  bridgeChains,
  getInitialDestinationChainId,
} from "@/components/bridge/lib/constants";
import { useBridgeQuote } from "@/components/bridge/lib/queries";
import { useWriteBridge } from "@/components/bridge/lib/mutations";
import { CtaButton } from "@/components/common/CtaButton";
import { useChain } from "@/hooks/useChain";
import { formatNumber } from "@/utils/number";
import { reducedMotionAccordionVariants } from "@/lib/motion/motion";
import { Button } from "@/components/ui/button";

interface RecoverBridgeOutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originTokenSymbol: string;
  alAssetAddress: `0x${string}`;
  xAlAssetAddress: `0x${string}`;
  amount: string;
  onBridgeReceipt: (hash: `0x${string}`) => void;
}

const destinationSelection = bridgeChains.filter((c) => c.id !== mainnet.id);

export const RecoverBridgeOutModal = ({
  open,
  onOpenChange,
  originTokenSymbol,
  alAssetAddress,
  xAlAssetAddress,
  amount,
  onBridgeReceipt,
}: RecoverBridgeOutModalProps) => {
  const isReducedMotion = useReducedMotion();

  const chain = useChain();
  const { switchChain } = useSwitchChain();

  const [destinationChainId, setDestinationChainId] = useState(() =>
    getInitialDestinationChainId(mainnet.id),
  );
  const destinationChain = bridgeChains.find(
    (c) => c.id === destinationChainId,
  );

  const [isDifferentAddress, setIsDifferentAddress] = useState(false);
  const [receipientAddress, setReceipientAddress] = useState("");
  const [showDifferentAddressError, setShowDifferentAddressError] =
    useState(false);
  const [confirmedDifferentAddress, setConfirmedDifferentAddress] =
    useState(false);

  const { address = zeroAddress } = useAccount();

  const receipient =
    confirmedDifferentAddress && isAddress(receipientAddress)
      ? receipientAddress
      : address;
  const { data: quote } = useBridgeQuote({
    originChainId: mainnet.id,
    destinationChainId,
    originTokenAddress: alAssetAddress,
    amount,
    receipient,
  });

  const { isApprovalNeeded, isPending, writeApprove, writeBridge } =
    useWriteBridge({
      amount,
      originChainId: mainnet.id,
      originTokenAddress: xAlAssetAddress,
      quote,
      onBridgeReceipt,
    });

  const handleDestinationChainSelect = useCallback((chainId: string) => {
    const newChainId = Number(chainId) as SupportedBridgeChainIds;
    setDestinationChainId(newChainId);
  }, []);

  const handleDifferentAddressSwitch = () => {
    setReceipientAddress("");
    setIsDifferentAddress((prev) => !prev);
    setShowDifferentAddressError(false);
    setConfirmedDifferentAddress(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceipientAddress(e.target.value);
    if (showDifferentAddressError) {
      setShowDifferentAddressError(false);
    }
  };

  const handleClearDifferentAddress = () => {
    setReceipientAddress("");
    setShowDifferentAddressError(false);
    setConfirmedDifferentAddress(false);
  };

  const handleConfirmedDifferentAddress = () => {
    if (!isAddress(receipientAddress)) {
      setShowDifferentAddressError(true);
      return;
    }
    setConfirmedDifferentAddress((prev) => !prev);
  };

  const onCtaClick = () => {
    if (
      !quote ||
      quote.isDestinationBridgeLimitExceeded ||
      quote.isToMainnetLockboxBalanceExceeded
    ) {
      return;
    }

    if (quote.tx.chainId !== chain.id) {
      switchChain({
        chainId: quote.tx.chainId,
      });
      return;
    }

    if (isApprovalNeeded) {
      writeApprove();
      return;
    }

    writeBridge();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bridge back</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-lg font-medium">
            {formatNumber(amount)} {originTokenSymbol}
          </p>
          <div className="flex items-center gap-2">
            <p>Bridge back to:</p>
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
                {destinationSelection.map((chain) => (
                  <SelectItem key={chain.id} value={chain.id.toString()}>
                    {chain.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center">
          <Switch
            checked={isDifferentAddress}
            onCheckedChange={handleDifferentAddressSwitch}
            id="is-different-address-bridge-out-modal"
          />
          <label
            className="text-lightgrey10inverse dark:text-lightgrey10 cursor-pointer pl-2 text-sm"
            htmlFor="is-different-address-bridge-out-modal"
          >
            Bridge to different wallet
          </label>
        </div>
        <AnimatePresence initial={false} mode="popLayout">
          {isDifferentAddress && (
            <m.div
              key="differentAddressInput-recover-bridge-out-modal"
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
                  onChange={handleInputChange}
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
              <div>
                <div className="flex items-center">
                  <Switch
                    checked={confirmedDifferentAddress}
                    onCheckedChange={handleConfirmedDifferentAddress}
                    id="confirmed-different-address-bridge-out-modal"
                  />
                  <label
                    className="text-lightgrey10inverse dark:text-lightgrey10 cursor-pointer pl-2 text-sm"
                    htmlFor="confirmed-different-address-bridge-out-modal"
                  >
                    I have verified the above address
                  </label>
                </div>
                <AnimatePresence initial={false} mode="popLayout">
                  {showDifferentAddressError && (
                    <m.div
                      key="showDifferentAddressError-recover-bridge-out-modal"
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
                      transition={{
                        type: "spring",
                        duration: 0.2,
                        bounce: 0,
                      }}
                    >
                      <p className="text-xs text-red-500">Invalid address</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </m.div>
          )}
        </AnimatePresence>
        <CtaButton
          variant="outline"
          width="full"
          disabled={
            !quote ||
            quote.isDestinationBridgeLimitExceeded ||
            quote.isToMainnetLockboxBalanceExceeded ||
            isPending
          }
          onClick={onCtaClick}
        >
          {chain.id !== mainnet.id
            ? "Switch chain"
            : isPending
              ? "Preparing"
              : isApprovalNeeded === true
                ? "Approve"
                : "Bridge"}
        </CtaButton>
      </DialogContent>
    </Dialog>
  );
};
