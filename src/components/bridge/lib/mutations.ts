import { useQueryClient } from "@tanstack/react-query";
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
import { isInputZero } from "@/utils/inputNotZero";

import { Quote, RecoveryQuote, SupportedBridgeChainIds } from "./constants";

export const useWriteBridge = ({
  quote,
  originTokenAddress,
  originChainId,
  amount,
  onBridgeReceipt,
}: {
  quote: Quote | undefined;
  originTokenAddress: `0x${string}`;
  originChainId: SupportedBridgeChainIds;
  amount: string;
  onBridgeReceipt: (hash: `0x${string}`) => void;
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
    decimals: 18,
    spender: quote?.tx.to ?? zeroAddress,
    enabled:
      !!quote && chain.id === originChainId && chain.id === quote.tx.chainId,
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
      onBridgeReceipt(receipt.transactionHash);
      resetBridge();
    }
  }, [onBridgeReceipt, receipt, resetBridge]);

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
    if (!quote) return;
    if (quote.tx.chainId !== chain.id) return;

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

export const useExchangeXAlAsset = ({
  quote,
}: {
  quote: RecoveryQuote | undefined;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();
  const queryClient = useQueryClient();

  const {
    data: exchangeConfig,
    error: exchangeError,
    isPending: isExchangeConfigPending,
  } = usePrepareTransactionRequest({
    ...(quote ? quote.tx : {}),
    query: {
      enabled:
        !!quote && quote.xAlAssetBalance > 0n && quote.tx.chainId === chain.id,
    },
  });

  const {
    sendTransaction: exchange,
    data: exchangeTxHash,
    reset: resetExchange,
  } = useSendTransaction({
    mutation: mutationCallback({
      action: "Exchange",
    }),
  });

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: exchangeTxHash,
    chainId: chain.id,
  });

  useEffect(() => {
    if (receipt) {
      resetExchange();
      queryClient.invalidateQueries({
        predicate: (query) =>
          !!query.queryKey[1] &&
          typeof query.queryKey[1] === "object" &&
          "functionName" in query.queryKey[1] &&
          query.queryKey[1].functionName === "balanceOf",
      });
    }
  }, [queryClient, receipt, resetExchange]);

  const writeExchange = () => {
    if (exchangeError) {
      toast.error("Exchange failed", {
        description:
          "cause" in exchangeError &&
          exchangeError.cause &&
          typeof exchangeError.cause === "object" &&
          "message" in exchangeError.cause &&
          exchangeError.cause.message &&
          typeof exchangeError.cause.message === "string"
            ? exchangeError.cause.message
            : exchangeError.message,
      });
      return;
    }
    if (exchangeConfig) {
      exchange(exchangeConfig);
    } else {
      toast.error("Exchange failed", {
        description: "Exchange unknown error. Please notify Alchemix team.",
      });
    }
  };

  const isPending = (() => {
    if (!quote) return;
    if (quote.tx.chainId !== chain.id) return;
    if (!quote.xAlAssetBalance) return;
    if (quote.alAssetLockboxLiquidity < quote.xAlAssetBalance) return;

    return isExchangeConfigPending;
  })();

  return {
    writeExchange,
    isPendingExchange: isPending,
  };
};
