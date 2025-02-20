import { toast } from "sonner";
import { parseEther } from "viem";
import { fantom, linea, metis } from "viem/chains";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect } from "react";
import { CircleCheckIcon, CircleIcon } from "lucide-react";

import { wormholeBridgeAdapterAbi } from "@/abi/wormholeBridgeAdapter";
import { CtaButton } from "@/components/common/CtaButton";
import { useAllowance } from "@/hooks/useAllowance";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";
import { isInputZero } from "@/utils/inputNotZero";
import { SYNTHS_TO_XERC20_MAPPING } from "@/lib/config/synths";
import {
  SupportedBridgeChainIds,
  bridgeChains,
  chainIdToWormholeChainIdMapping,
  wormholeTargetMapping,
} from "@/components/bridge/lib/constants";
import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";

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
  originChainId: SupportedChainId;
  destinationChainId: SupportedBridgeChainIds;
  bridgeCost: string | undefined;
  isActive: boolean;
  hasBridged: boolean;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  const spender =
    originChainId === fantom.id
      ? wormholeTargetMapping[bridgeChains[0].id][originTokenAddress]
      : wormholeTargetMapping[originChainId][originTokenAddress];

  if (destinationChainId === linea.id || destinationChainId === metis.id) {
    throw new Error("BridgeStep is not supported on this chain");
  }
  const destinationWormholeChainId =
    chainIdToWormholeChainIdMapping[destinationChainId];

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
    spender: spender,
    decimals: AL_ASSETS_DECIMALS,
  });

  const {
    data: bridgeConfig,
    error: bridgeError,
    isPending: isBridgeConfigPending,
  } = useSimulateContract({
    address: spender,
    abi: wormholeBridgeAdapterAbi,
    functionName: "bridge",
    args: [BigInt(destinationWormholeChainId), parseEther(amount), address!],
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
            disabled={isPending || isLoadingApprovalReceipt}
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
