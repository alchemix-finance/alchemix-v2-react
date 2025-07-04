import {
  usePrepareTransactionRequest,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useEffect } from "react";
import { toast } from "sonner";
import { zeroAddress } from "viem";

import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { useAllowance } from "@/hooks/useAllowance";
import { Token } from "@/lib/types";
import { isInputZero } from "@/utils/inputNotZero";
import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";

import { Quote } from "./constants";

export const useWriteBridge = ({
  quote,
  originTokenAddress,
  originChainId,
  token,
  amount,
  updateBridgeTxHash,
}: {
  quote: Quote | undefined;
  originTokenAddress: `0x${string}`;
  originChainId: SupportedChainId;
  token: Token | undefined;
  amount: string;
  updateBridgeTxHash: (hash: `0x${string}`) => void;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const {
    isApprovalNeeded,
    approve,
    approveConfig,
    isFetching: isFetchingAllowance,
    isPending: isPendingAllowance,
  } = useAllowance({
    tokenAddress: originTokenAddress,
    amount,
    decimals: token?.decimals,
    spender: quote?.tx.to ?? zeroAddress,
    enabled: chain.id === originChainId,
  });

  const {
    data: bridgeConfig,
    error: bridgeError,
    isPending: isBridgeConfigPending,
  } = usePrepareTransactionRequest({
    ...(quote ? quote.tx : {}),
    query: {
      enabled: !!quote && !isInputZero(amount) && isApprovalNeeded === false,
    },
  });

  const {
    sendTransaction: bridge,
    data: bridgeTxHash,
    reset: resetBridge,
  } = useSendTransaction({
    mutation: mutationCallback({
      action: "Bridge",
    }),
  });

  const { data: receipt } = useWaitForTransactionReceipt({
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
        description:
          "cause" in bridgeError &&
          bridgeError.cause &&
          typeof bridgeError.cause === "object" &&
          "message" in bridgeError.cause &&
          bridgeError.cause.message &&
          typeof bridgeError.cause.message === "string"
            ? bridgeError.cause.message
            : bridgeError.message,
      });
      return;
    }
    if (bridgeConfig) {
      bridge(bridgeConfig);
    } else {
      toast.error("Bridge failed", {
        description: "Bridge unknown error. Please notify Alchemix team.",
      });
    }
  };

  const isPending = (() => {
    if (!amount) return;
    if (originChainId !== chain.id) return;
    if (!quote || quote.isWrapNeeded) return;

    if (isApprovalNeeded === false) {
      return isBridgeConfigPending;
    } else return isPendingAllowance || isFetchingAllowance;
  })();

  return {
    writeBridge,
    writeApprove,
    isApprovalNeeded,
    isPending,
  };
};
