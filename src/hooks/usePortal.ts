import {
  usePrepareTransactionRequest,
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
import { queryClient } from "@/components/providers/QueryProvider";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { useWriteContractMutationCallback } from "./useWriteContractMutationCallback";
import { GAS_ADDRESS } from "@/lib/constants";

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
  portalGaslessSignature: `0x${string}` | undefined;
  inputToken: string;
  inputTokenDecimals: number;
  inputAmount: string;
  outputToken: string;
  address: string;
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

export const usePortalAllowance = ({
  address,
  inputToken,
  inputAmount,
  inputTokenDecimals,
}: {
  address: `0x${string}`;
  inputToken: `0x${string}`;
  inputAmount: string;
  inputTokenDecimals: number;
}) => {
  const chain = useChain();

  return useQuery({
    queryKey: [
      QueryKeys.PortalCheckApproval,
      address,
      inputToken,
      inputTokenDecimals,
      inputAmount,
    ],
    queryFn: async () => {
      const url = new URL(`${PORTAL_API_BASE_URI}/approval`);
      url.searchParams.append("sender", address);
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
        isPortalApprovalNeeded: portalRouterApprovalData.context.shouldApprove,
        canPermit: portalRouterApprovalData.context.canPermit,
        routerAddress: portalRouterApprovalData.context.target,
        approveTx: portalRouterApprovalData.approve,
        permit: portalRouterApprovalData.permit,
      };
    },
    enabled: inputToken !== GAS_ADDRESS,
  });
};

export const usePortalApprove = ({
  approveTx,
  permit,
  canPermit,
  isPortalApprovalNeeded,
}: {
  approveTx: TransactionToSubmit | undefined;
  permit: PermitTx | undefined;
  canPermit: boolean | undefined;
  isPortalApprovalNeeded: boolean | undefined;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

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
    isPending,
    error: prepareTxError,
  } = usePrepareTransactionRequest({
    to: approveTx?.to,
    data: approveTx?.data,
    account: approveTx?.from,
    chainId: chain.id,
    query: {
      enabled:
        !!approveTx && canPermit === false && isPortalApprovalNeeded === true,
    },
  });

  const {
    sendTransaction: approve,
    data: approveTxHash,
    reset: resetApprove,
  } = useSendTransaction({
    mutation: mutationCallback({
      action: "Approve input token",
    }),
  });

  const { data: approveReceipt } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    chainId: chain.id,
  });

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
    if (isPortalApprovalNeeded === false) return;

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
      approve(approveConfig);
    } else {
      toast.error(
        "Failed to send transaction. This is likely due to a pending prepareTransactionRequest.",
      );
    }
  };

  return {
    mutate,
    signature,
    isPending,
    resetGaslessSignature,
  };
};

export const usePortalQuote = (params: PortalQuoteParams) => {
  const chain = useChain();

  return useQuery({
    queryKey: [QueryKeys.PortalCreateQuote, params],
    queryFn: async () => {
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
      url.searchParams.append("sender", params.address);

      if (params.slippage) {
        url.searchParams.append(
          "slippageTolerancePercentage",
          `${Number(params.slippage)}`,
        );
      }

      if (params.portalGaslessSignature) {
        // Append the gasless transaction signature
        url.searchParams.append(
          "permitSignature",
          `${params.portalGaslessSignature}`,
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
    },
    enabled: params.shouldQuote,
  });
};

export const useSendPortalTransaction = ({
  quote,
  quoteError,
  onSuccess,
}: {
  quote: PortalQuoteResponse | undefined;
  quoteError: Error | null;
  onSuccess?: () => void;
}) => {
  const chain = useChain();
  const {
    data: transactionConfig,
    error: prepareTxError,
    isPending,
  } = usePrepareTransactionRequest({
    to: quote?.tx.to,
    data: quote?.tx.data,
    value: quote?.tx.value,
    chainId: chain.id,
    query: {
      enabled: !!quote,
    },
  });
  const mutationCallback = useWriteContractMutationCallback();

  const {
    sendTransaction,
    data: txHash,
    reset: resetSendPortalTx,
  } = useSendTransaction({
    mutation: mutationCallback({
      action: "Execute portal zap",
    }),
  });

  const { data: sendTxReceipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

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

  return { mutate, isPending };
};
