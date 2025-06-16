import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatNumber } from "@/utils/number";
import { StatusBox } from "@/components/bridge/StatusBox";
import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";
import { Quote } from "@/components/bridge/lib/constants";

import { WrapStep } from "./WrapStep";
import { BridgeStep } from "./BridgeStep";

interface BridgeWrapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  originTokenAddress: `0x${string}`;
  originTokenSymbol: string | undefined;
  originChainId: SupportedChainId;
  destinationChainName: string | undefined;
  bridgeTxHash: `0x${string}` | undefined;
  quote: Quote | undefined;
  updateBridgeTxHash: (hash: `0x${string}`) => void;
}

export const BridgeWrapModal = ({
  open,
  onOpenChange,
  amount,
  originTokenAddress,
  originTokenSymbol,
  originChainId,
  destinationChainName,
  bridgeTxHash,
  quote,
  updateBridgeTxHash,
}: BridgeWrapModalProps) => {
  const [step, setStep] = useState<"wrap" | "bridge">("wrap");

  const setBridgeStep = () => {
    setStep("bridge");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Bridge {originTokenSymbol}</DialogTitle>
        </DialogHeader>
        <div>
          <p className="tracking-tighter">Bridging</p>
          <p className="text-lg font-medium">
            {formatNumber(amount)} {originTokenSymbol}
          </p>
          <p className="tracking-tighter">
            From Ethereum to {destinationChainName}
          </p>
        </div>
        <div className="bg-grey10inverse dark:bg-grey10 space-y-4 rounded-md p-4">
          <WrapStep
            originTokenAddress={originTokenAddress}
            amount={amount}
            setBridgeStep={setBridgeStep}
            isActive={step === "wrap"}
          />
          <BridgeStep
            originTokenAddress={originTokenAddress}
            originChainId={originChainId}
            amount={amount}
            hasBridged={!!bridgeTxHash}
            updateBridgeTxHash={updateBridgeTxHash}
            isActive={step === "bridge"}
            quote={quote}
          />
        </div>
        <StatusBox transactionHash={bridgeTxHash} />
      </DialogContent>
    </Dialog>
  );
};
