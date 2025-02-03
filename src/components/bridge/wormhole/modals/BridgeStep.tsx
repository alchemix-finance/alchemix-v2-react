import { toast } from "sonner";
import { parseEther } from "viem";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect } from "react";
import { CircleCheckIcon, CircleIcon } from "lucide-react";

import { wormholeBridgeAdapterAbi } from "@/abi/wormholeBridgeAdapter";
import {
  getDestinationWormholeChainId,
  getSpender,
} from "@/components/bridge/wormhole/lib/utils";
import { CtaButton } from "@/components/common/CtaButton";
import { useAllowance } from "@/hooks/useAllowance";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";
import { isInputZero } from "@/utils/inputNotZero";
import { SYNTHS_TO_XERC20_MAPPING } from "@/lib/config/synths";

const AL_ASSETS_DECIMALS = 18;

export const BridgeStep = ({
  originTokenAddress,
  amount,
  updateBridgeTxHash,
  originChainId,
  destinationChainId,
  bridgeCost,
  isActive,
  hasBridged,
}: {
  originTokenAddress: `0x${string}`;
  amount: string;
  updateBridgeTxHash: (hash: `0x${string}`) => void;
  originChainId: number;
  destinationChainId: number;
  bridgeCost: string | undefined;
  isActive: boolean;
  hasBridged: boolean;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  const {
    isApprovalNeeded,
    approveConfig,
    approve,
    isFetching: isFetchingAllowance,
    isPending: isPendingAllowance,
    isLoadingApprovalReceipt,
  } = useAllowance({
    amount,
    tokenAddress: SYNTHS_TO_XERC20_MAPPING[originTokenAddress],
    spender: getSpender({ originChainId, originTokenAddress }),
    decimals: AL_ASSETS_DECIMALS,
  });

  const {
    data: bridgeConfig,
    error: bridgeError,
    isPending: isBridgeConfigPending,
  } = useSimulateContract({
    address: getSpender({ originChainId, originTokenAddress }),
    abi: wormholeBridgeAdapterAbi,
    functionName: "bridge",
    args: [
      BigInt(getDestinationWormholeChainId(destinationChainId)),
      parseEther(amount),
      address!,
    ],
    value: parseEther(bridgeCost ?? "0"),
    chainId: chain.id,
    query: {
      enabled:
        !isInputZero(amount) &&
        !!address &&
        isApprovalNeeded === false &&
        bridgeCost !== undefined,
    },
  });

  const {
    writeContract: bridge,
    data: bridgeTxHash,
    reset: resetBridge,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Bridge",
    }),
  });

  const { data: receipt, isLoading: isLoadingBridgeReceipt } =
    useWaitForTransactionReceipt({
      hash: bridgeTxHash,
      chainId: chain.id,
    });

  useEffect(() => {
    if (receipt) {
      updateBridgeTxHash(receipt.transactionHash);
      resetBridge();
    }
  }, [receipt, resetBridge, updateBridgeTxHash]);

  const writeApprove = () => {
    approveConfig?.request && approve(approveConfig.request);
  };

  const writeBridge = () => {
    if (bridgeError) {
      toast.error("Bridge failed", {
        description: getToastErrorMessage({ error: bridgeError }),
      });
      return;
    }
    if (bridgeConfig) {
      bridge(bridgeConfig.request);
    } else {
      toast.error("Bridge failed", {
        description: "Bridge unknown error. Please notify Alchemix team.",
      });
    }
  };

  const onCtaClick = () => {
    if (isApprovalNeeded) {
      writeApprove();
    } else {
      writeBridge();
    }
  };

  const isPending = (() => {
    if (isApprovalNeeded === false) {
      return isBridgeConfigPending;
    } else return isPendingAllowance || isFetchingAllowance;
  })();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2">
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
            className="text-base"
            disabled={isPending || isLoadingApprovalReceipt}
            onClick={onCtaClick}
          >
            {isPending ? "Preparing" : "Approve"}
          </CtaButton>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2">
          {hasBridged ? (
            <CircleCheckIcon className="h-4 w-4" />
          ) : (
            <CircleIcon className="h-4 w-4" />
          )}
          <span>Bridge via Wormhole</span>
        </h2>
        {isApprovalNeeded === false && isActive && (
          <CtaButton
            variant="outline"
            size="sm"
            weight="normal"
            className="text-base"
            disabled={isPending || isLoadingBridgeReceipt}
            onClick={onCtaClick}
          >
            {isPending ? "Preparing" : "Bridge"}
          </CtaButton>
        )}
      </div>
    </div>
  );
};
