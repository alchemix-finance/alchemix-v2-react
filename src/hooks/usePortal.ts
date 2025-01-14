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
      "portalCheckApproval",
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

  const { signTypedData, data: signature } = useSignTypedData({
    // TODO: Add onSuccess and onError handlers (reuse similar logic as useWriteContractMutationCallback but for signTypedData instead of writeContract)
    mutation: {
      onSuccess: () => {},
      onError: () => {},
    },
  });

  const { data: approveConfig } = usePrepareTransactionRequest({
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
    // TODO: Add onSuccess and onError handlers (reuse similar logic as useWriteContractMutationCallback but for sendTransaction instead of writeContract)
    mutation: {
      onSuccess: () => {},
      onError: () => {},
    },
  });

  const { data: approveReceipt } = useWaitForTransactionReceipt({
    hash: approveTxHash,
    chainId: chain.id,
  });

  useEffect(() => {
    if (approveReceipt) {
      resetApprove();
      // TODO: Handle approval receipt (refetch stuff: probably refetch is approval is needed)
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

    if (approveConfig !== undefined) {
      return approve(approveConfig);
    }
  };

  return {
    mutate,
    signature,
  };
};

export const usePortalQuote = (params: PortalQuoteParams) => {
  const chain = useChain();

  return useQuery({
    queryKey: ["portalQuote", params],
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
      url.searchParams.append("sender", params.sender);

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
    },
    enabled: params.shouldQuote,
  });
};

export const useSendPortalTransaction = (
  params: PortalQuoteResponse | undefined,
) => {
  const chain = useChain();
  const { data: transactionConfig } = usePrepareTransactionRequest({
    to: params?.tx.to,
    data: params?.tx.data,
    value: params?.tx.value,
    chainId: chain.id,
    query: {
      enabled: !!params,
    },
  });

  const {
    sendTransaction,
    data: txHash,
    error,
  } = useSendTransaction({
    // TODO: Add onSuccess and onError handlers (reuse similar logic as useWriteContractMutationCallback but for sendTransaction instead of writeContract)
    mutation: {
      onSuccess: () => {},
      onError: () => {},
    },
  });

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (receipt) {
      // TODO: Handle transaction receipt (refetch stuff and setAmounts back to empty string etc)
    }
  });

  const mutate = () => {
    if (error) {
      // Add error handling
    }
    if (transactionConfig) {
      return sendTransaction(transactionConfig);
    } else {
      // Add error handling
    }
  };

  return { mutate };
};
