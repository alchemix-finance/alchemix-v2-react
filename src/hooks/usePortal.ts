import {
  usePrepareTransactionRequest,
  useSendTransaction,
  useWalletClient,
} from "wagmi";
import { useChain } from "./useChain";
import { useMutation, useQuery } from "@tanstack/react-query";
import { arbitrum, fantom, mainnet, optimism } from "viem/chains";
import { parseUnits } from "viem";

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

export type PortalTransactionResult =
  | { hash: string; signature?: undefined }
  | { signature: string; hash?: undefined };

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

  return useQuery<{
    shouldApprove: boolean;
    canPermit: boolean;
    routerAddress: `0x${string}`;
    approveTx: TransactionToSubmit;
    permit: PermitTx;
  }>({
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
        approveTx: portalRouterApprovalData.approve as TransactionToSubmit,
        permit: portalRouterApprovalData.permit as PermitTx,
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
  canPermit: boolean;
  shouldApprove: boolean;
}) => {
  const { sendTransaction } = useSendTransaction();
  const preparedTransactionConfig =
    !canPermit && shouldApprove
      ? {
          to: (approveTx as TransactionToSubmit).to,
          data: (approveTx as TransactionToSubmit).data,
          account: (approveTx as TransactionToSubmit).from,
        }
      : undefined;
  const { isError: isPrepareTxRequestError } = usePrepareTransactionRequest(
    preparedTransactionConfig,
  );
  const { data: walletClient } = useWalletClient();

  return useMutation({
    mutationFn: async () => {
      if (!shouldApprove) {
        return {};
      }

      if (canPermit && permit) {
        if (!walletClient) throw new Error("No wallet client found");

        const signature = await walletClient.signTypedData({
          domain: permit.domain,
          types: permit.types,
          message: permit.value,
          primaryType: "Permit",
        });

        return { signature };
      } else {
        if (isPrepareTxRequestError) {
          throw new Error(`Failed to prepare transaction for approval tx`);
        }

        const hash = sendTransaction({
          to: (approveTx as TransactionToSubmit).to,
          data: (approveTx as TransactionToSubmit).data,
          account: (approveTx as TransactionToSubmit).from,
          gas: BigInt((approveTx as TransactionToSubmit).gasLimit),
        });

        return { hash };
      }
    },
    onError: (error) => {
      console.log(`Error approving input token through portal: ${error}`);
    },
  });
};

export const usePortalQuote = (params: PortalQuoteParams) => {
  const chain = useChain();

  return useQuery({
    queryKey: [
      "portalQuote",
      params.inputToken,
      params.inputTokenDecimals,
      params.inputAmount,
      params.outputToken,
      params.sender,
    ],
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
  const { sendTransaction } = useSendTransaction();
  const chain = useChain();

  return useMutation({
    mutationFn: async () => {
      if (!params) {
        throw new Error(
          "Undefined portal quote. A failure likely occured when trying to create quote that was expected to succeed.",
        );
      }

      const hash = sendTransaction({
        to: params.tx.to,
        data: params.tx.data,
        value: params.tx.value,
      });

      console.log("Transaction sent:", hash);
    },
    onError: (error) => {
      console.log(`Error executing zap through portal: ${error}`);
    },
  });
};
