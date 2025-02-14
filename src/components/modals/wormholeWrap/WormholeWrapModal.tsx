import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WrapStep } from "./WrapStep";
import { BridgeStep } from "./BridgeStep";
import { formatNumber } from "@/utils/number";
import { StatusBox } from "@/components/bridge/StatusBox";
import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";
import { SupportedBridgeChainIds } from "@/components/bridge/lib/constants";

interface WormholeWrapModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: string;
  originTokenAddress: `0x${string}`;
  originTokenSymbol: string | undefined;
  originChainId: SupportedChainId;
  destinationChainId: SupportedBridgeChainIds;
  destinationChainName: string | undefined;
  bridgeCost: string | undefined;
  bridgeTxHash: `0x${string}` | undefined;
  updateBridgeTxHash: (hash: `0x${string}`) => void;
}

export const WormholeWrapModal = ({
  open,
  onOpenChange,
  amount,
  originTokenAddress,
  originTokenSymbol,
  originChainId,
  destinationChainId,
  destinationChainName,
  bridgeCost,
  bridgeTxHash,
  updateBridgeTxHash,
}: WormholeWrapModalProps) => {
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
        <div className="space-y-4 rounded-md bg-grey10inverse p-4 dark:bg-grey10">
          <WrapStep
            originTokenAddress={originTokenAddress}
            amount={amount}
            setBridgeStep={setBridgeStep}
            isActive={step === "wrap"}
          />
          <BridgeStep
            originTokenAddress={originTokenAddress}
            originChainId={originChainId}
            destinationChainId={destinationChainId}
            amount={amount}
            hasBridged={!!bridgeTxHash}
            updateBridgeTxHash={updateBridgeTxHash}
            bridgeCost={bridgeCost}
            isActive={step === "bridge"}
          />
        </div>
        <StatusBox transactionHash={bridgeTxHash} bridgeProvider="Wormhole" />
      </DialogContent>
    </Dialog>
  );
};
