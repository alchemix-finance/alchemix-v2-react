import {
  usePrepareTransactionRequest,
  usePublicClient,
  useSendTransaction,
  useSignTypedData,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { arbitrum, fantom, mainnet, optimism } from "viem/chains";
import { parseUnits } from "viem";
import { useEffect } from "react";

import { useChain } from "./useChain";
import { toast } from "sonner";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { mutationCallback } from "@/utils/helpers/mutationCallback";
import { queryClient } from "@/components/providers/QueryProvider";
import { QueryKeys } from "@/lib/queries/queriesSchema";

type PortalApprovalResponse = {
  context: PortalApprovalContext;
  approve?: TransactionToSubmit;
  permit?: PermitTx;
};

type PortalApprovalContext = {
  network: string;
  allowance: string;
  approvalAmount: string;
  shouldApprove: boolean;
  canPermit: boolean;
  spender: string;
  target: `0x${string}`;
};

type PermitTypes = {
  Permit: [
    { name: "owner"; type: "address" },
    { name: "spender"; type: "address" },
    { name: "value"; type: "uint256" },
    { name: "nonce"; type: "uint256" },
    { name: "deadline"; type: "uint256" },
  ];
};

type PermitTx = {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: `0x${string}`;
  };
  types: PermitTypes;
  value: {
    owner: `0x${string}`;
    spender: `0x${string}`;
    value: bigint;
    nonce: bigint;
    deadline: bigint;
  };
};

type TransactionToSubmit = {
  to: `0x${string}`;
  from: `0x${string}`;
  data: `0x${string}`;
  gasLimit: string;
  value?: bigint;
};

type PortalQuoteParams = {
  gaslessSignature: `0x${string}` | undefined;
  inputToken: string;
  inputTokenDecimals: number;
  inputAmount: string;
  outputToken: string;
  sender: string;
  shouldQuote: boolean;
  slippage?: string;
};

export type PortalQuoteResponse = {
  tx: TransactionToSubmit;
  context: PortalQuoteContext;
};

export type PortalQuoteContext = {
  orderId: string;
  minOutputAmount: string;
  minOutputAmountUsd: number;
  slippageTolerancePercentage: number;
  gasLimit: string;
  inputAmount: string;
  inputAmountUsd: number;
  inputToken: string;
  outputToken: string;
  outputAmount: string;
  outputAmountUsd: number;
  partner: string;
  feeToken: string;
  feeAmount: string;
  feeAmountUsd: number;
  sender: `0x${string}`;
  recipient: `0x${string}`;
  target: `0x${string}`;
  value: string;
  route: string[];
  steps: string[];
};

const PORTAL_API_BASE_URI = "https://api.portals.fi/v2";
const PORTALS_CHAIN_ID = {
  [mainnet.id]: "ethereum",
  [arbitrum.id]: "arbitrum",
  [optimism.id]: "optimism",
  [fantom.id]: "fantom",
};

export const useCheckApproval = (
  sender: `0x${string}`,
  inputToken: `0x${string}`,
  inputAmount: string,
  inputTokenDecimals: number,
) => {
  const chain = useChain();

  return useQuery({
    queryKey: [
      QueryKeys.PortalCheckApproval,
      sender,
      inputToken,
      inputAmount,
      inputTokenDecimals,
    ],
    queryFn: async () => {
      const url = new URL(`${PORTAL_API_BASE_URI}/approval`);
      url.searchParams.append("sender", sender);
      url.searchParams.append(
        "inputToken",
        `${PORTALS_CHAIN_ID[chain.id]}:${inputToken}`,
      );
      url.searchParams.append(
        "inputAmount",
        `${parseUnits(inputAmount || `0`, inputTokenDecimals)}`,
      );

      const response = await fetch(url.toString(), { method: "GET" });

      if (!response.ok) {
        throw new Error(
          `Error executing call to portal checkApproval: ${response.status} ${response.statusText}`,
        );
      }

      const portalRouterApprovalData =
        (await response.json()) as PortalApprovalResponse;

      return {
        shouldApprove: portalRouterApprovalData.context.shouldApprove,
        canPermit: portalRouterApprovalData.context.canPermit,
        routerAddress: portalRouterApprovalData.context.target,
        approveTx: portalRouterApprovalData.approve,
        permit: portalRouterApprovalData.permit,
      };
    },
  });
};

export const useApproveInputToken = ({
  approveTx,
  permit,
  canPermit,
  shouldApprove,
}: {
  approveTx: TransactionToSubmit | undefined;
  permit: PermitTx | undefined;
  canPermit: boolean | undefined;
  shouldApprove: boolean | undefined;
}) => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const addRecentTransaction = useAddRecentTransaction();

  const {
    signTypedData,
    data: signature,
    reset: resetGaslessSignature,
  } = useSignTypedData({
    mutation: {
      onSuccess: () => {
        toast.success("Gassless signature for approval created");
      },
      onError: (error) => {
        toast.error(`Gasless signature for approval failed`, {
          description: error.message.includes("User rejected the request")
            ? "Transaction rejected by user"
            : error.message,
        });
      },
    },
  });

  const {
    data: approveConfig,
    isLoading,
    error: prepareTxError,
  } = usePrepareTransactionRequest({
    to: approveTx?.to,
    data: approveTx?.data,
    account: approveTx?.from,
    chainId: chain.id,
    query: {
      enabled: !!approveTx && canPermit === false && shouldApprove === true,
    },
  });

  const {
    sendTransaction: approve,
    data: approveTxHash,
    reset: resetApprove,
  } = useSendTransaction({
    mutation: mutationCallback({
      action: "Approve input token",
      addRecentTransaction,
      publicClient,
    }),
  });

  const { data: approveReceipt } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    chainId: chain.id,
  });

  useEffect(() => {
    if (isLoading) {
      toast.loading("Preparing transaction request...");
    } else if (!isLoading && approveConfig) {
      toast.dismiss();
      toast.success("Transaction request prepared successfully!");
    } else if (!isLoading && prepareTxError) {
      toast.dismiss();
      toast.error(
        `Failed to prepare transaction: ${prepareTxError.message.split(".")[0]}`,
      );
    }
  }, [isLoading, approveConfig, prepareTxError]);

  useEffect(() => {
    if (approveReceipt) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PortalCheckApproval],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PortalCreateQuote],
      });
      resetApprove();
    }
  }, [approveReceipt, resetApprove]);

  const mutate = () => {
    if (shouldApprove === false) return;

    if (canPermit === true && permit !== undefined) {
      return signTypedData({
        domain: permit.domain,
        types: permit.types,
        message: permit.value,
        primaryType: "Permit",
      });
    }

    if (prepareTxError) {
      toast.error(
        `Failed to prepare transaction: ${prepareTxError.message.split(".")[0]}`,
      );
      return;
    }

    if (approveConfig !== undefined) {
      return approve(approveConfig);
    } else {
      toast.error(
        "Failed to send transaction. This is likely due to a pending prepareTransactionRequest.",
      );
      return;
    }
  };

  return {
    mutate,
    signature,
    isLoading,
    resetGaslessSignature,
  };
};

export const usePortalQuote = (params: PortalQuoteParams) => {
  const chain = useChain();

  return useQuery({
    queryKey: [QueryKeys.PortalCreateQuote, params],
    queryFn: async () => {
      const getPortalQuote = async () => {
        const url = new URL(`${PORTAL_API_BASE_URI}/portal`);
        url.searchParams.append(
          "inputToken",
          `${PORTALS_CHAIN_ID[chain.id]}:${params.inputToken}`,
        );
        url.searchParams.append(
          "inputAmount",
          `${parseUnits(params.inputAmount || "0", params.inputTokenDecimals)}`,
        );
        url.searchParams.append(
          "outputToken",
          `${PORTALS_CHAIN_ID[chain.id]}:${params.outputToken}`,
        );
        url.searchParams.append("sender", params.sender);

        if (params.slippage) {
          url.searchParams.append(
            "slippageTolerancePercentage",
            `${Number(params.slippage)}`,
          );
        }

        if (params.gaslessSignature) {
          // Append the gasless transaction signature
          url.searchParams.append(
            "permitSignature",
            `${params.gaslessSignature}`,
          );
        }

        const response = await fetch(url.toString(), {
          method: "GET",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Failed to fetch portal quote ${error?.message}`);
        }

        const portalQuote = (await response.json()) as PortalQuoteResponse;

        return portalQuote;
      };

      const getQuotePromise = getPortalQuote();

      toast.promise(getQuotePromise, {
        loading: "Getting portal quote...",
        success: "Portal quote retrieved successfully!",
        error: "Failed to create quote for transaction",
      });

      return await getQuotePromise;
    },
    retry: false,
    enabled: params.shouldQuote,
  });
};

export const useSendPortalTransaction = (
  params: PortalQuoteResponse | undefined,
  quoteError: Error | null,
  onSuccess?: () => void,
) => {
  const chain = useChain();
  const {
    data: transactionConfig,
    error: prepareTxError,
    isLoading,
  } = usePrepareTransactionRequest({
    to: params?.tx.to,
    data: params?.tx.data,
    value: params?.tx.value,
    chainId: chain.id,
    query: {
      enabled: !!params,
    },
  });
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const addRecentTransaction = useAddRecentTransaction();

  const {
    sendTransaction,
    data: txHash,
    reset: resetSendPortalTx,
  } = useSendTransaction({
    mutation: mutationCallback({
      action: "Execute portal zap",
      addRecentTransaction,
      publicClient,
    }),
  });

  const { data: sendTxReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isLoading) {
      toast.loading("Preparing transaction request...");
    } else if (!isLoading && transactionConfig) {
      toast.dismiss();
      toast.success("Transaction request prepared successfully!");
    } else if (!isLoading && prepareTxError) {
      toast.dismiss();
      toast.error(
        `Failed to prepare transaction: ${prepareTxError.message.split(".")[0]}`,
      );
    }
  }, [isLoading, transactionConfig, prepareTxError]);

  useEffect(() => {
    if (sendTxReceipt) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PortalCheckApproval],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PortalCreateQuote],
      });
      resetSendPortalTx();

      if (onSuccess) {
        onSuccess();
      }
    }
  }, [sendTxReceipt, onSuccess, resetSendPortalTx]);

  const mutate = () => {
    if (quoteError) {
      toast.error(
        `Failed to create quote for transaction: ${quoteError.message.split(".")[0]}`,
      );
      return;
    }

    if (prepareTxError) {
      toast.error(
        `Failed to prepare transaction: ${prepareTxError.message.split(".")[0]}`,
      );
      return;
    }

    if (transactionConfig) {
      return sendTransaction(transactionConfig);
    }
  };

  return { mutate, isLoading };
};
