import { useSwitchChain } from "wagmi";
import { CircleCheckIcon, CircleIcon } from "lucide-react";

import { CtaButton } from "@/components/common/CtaButton";
import { useChain } from "@/hooks/useChain";
import { SYNTHS_TO_XERC20_MAPPING } from "@/lib/config/synths";
import { Quote } from "@/components/bridge/lib/constants";
import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { useWriteBridge } from "@/components/bridge/lib/mutations";

export const BridgeStep = ({
  originTokenAddress,
  amount,
  updateBridgeTxHash,
  originChainId,
  isActive,
  hasBridged,
  quote,
}: {
  originTokenAddress: `0x${string}`;
  amount: string;
  updateBridgeTxHash: (hash: `0x${string}`) => void;
  originChainId: SupportedChainId;
  isActive: boolean;
  hasBridged: boolean;
  quote: Quote | undefined;
}) => {
  const chain = useChain();
  const { switchChain } = useSwitchChain();

  const { data: tokens } = useTokensQuery(originChainId);
  const token = tokens?.find(
    (t) => t.address.toLowerCase() === originTokenAddress.toLowerCase(),
  );

  const { isApprovalNeeded, isPending, writeApprove, writeBridge } =
    useWriteBridge({
      amount,
      originTokenAddress: SYNTHS_TO_XERC20_MAPPING[originTokenAddress],
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

    if (isApprovalNeeded) {
      writeApprove();
      return;
    }

    writeBridge();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 leading-8">
          {isApprovalNeeded === false ? (
            <CircleCheckIcon className="h-4 w-4" />
          ) : (
            <CircleIcon className="h-4 w-4" />
          )}
          <span>Approve bridge</span>
        </h2>
        {isApprovalNeeded && isActive && (
          <CtaButton
            variant="outline"
            size="sm"
            weight="normal"
            className="w-1/3 text-base"
            disabled={isPending}
            onClick={onCtaClick}
          >
            {isPending ? "Preparing" : "Approve"}
          </CtaButton>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 leading-8">
          {hasBridged ? (
            <CircleCheckIcon className="h-4 w-4" />
          ) : (
            <CircleIcon className="h-4 w-4" />
          )}
          <span>Bridge via Wormhole</span>
        </h2>
        {isApprovalNeeded === false && isActive && !hasBridged && (
          <CtaButton
            variant="outline"
            size="sm"
            weight="normal"
            className="w-1/3 text-base"
            disabled={isPending}
            onClick={onCtaClick}
          >
            {isPending ? "Preparing" : "Bridge"}
          </CtaButton>
        )}
      </div>
    </div>
  );
};
