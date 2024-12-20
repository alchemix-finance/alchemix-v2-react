import { useSendTransaction, useWalletClient } from "wagmi";
import { useChain } from "./useChain";
import {
  UseMutateAsyncFunction,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { arbitrum, fantom, mainnet, optimism } from "viem/chains";
import { parseUnits } from "viem";
import { ZERO_ADDRESS } from "@/lib/constants";

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
  approveInputToken: UseMutateAsyncFunction;
  shouldApprove: unknown;
  gaslessSignature: `0x${string}` | undefined;
  inputToken: string;
  inputTokenDecimals: number;
  inputAmount: string;
  outputToken: string;
  sender: string;
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

const useCheckApproval = (
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

      const portalRouterApprovalData = await response.json();

      return {
        shouldApprove: portalRouterApprovalData.context.shouldApprove,
        canPermit: portalRouterApprovalData.context.canPermit,
        routerAddress: portalRouterApprovalData.context.target,
        approveTx: portalRouterApprovalData?.approve,
        permit: portalRouterApprovalData?.permit,
      };
    },
  });
};

const useApproveInputToken = ({
  approveTx,
  permit,
  canPermit,
  shouldApprove,
}: {
  approveTx: TransactionToSubmit;
  permit: PermitTx;
  canPermit: boolean;
  shouldApprove: boolean;
}) => {
  const { sendTransactionAsync } = useSendTransaction();
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
        const hash = await sendTransactionAsync({
          to: approveTx.to,
          data: approveTx.data,
          account: approveTx.from,
          gas: BigInt(approveTx.gasLimit),
        });

        return { hash };
      }
    },
    onError: (error) => {
      console.log(`Error approving input token through portal: ${error}`);
    },
  });
};

export const usePortalApproval = (
  sender: `0x${string}`,
  inputToken: `0x${string}`,
  inputAmount: string,
  gaslessSignature: `0x${string}` | undefined,
  inputTokenDecimals: number,
) => {
  const { data, isLoading, error } = useCheckApproval(
    sender,
    inputToken,
    inputAmount,
    inputTokenDecimals,
  );

  const { mutateAsync: approveInputToken } = useApproveInputToken({
    approveTx: data?.approveTx,
    permit: data?.permit,
    canPermit: data?.canPermit,
    shouldApprove: data?.shouldApprove,
  });

  return {
    isLoading,
    error,
    approveInputToken,
    routerAddress: data?.routerAddress,
    shouldApprove: gaslessSignature ? false : data?.shouldApprove,
  };
};

const useSendPortalTransaction = (params: PortalQuoteParams) => {
  const { sendTransactionAsync } = useSendTransaction();
  const chain = useChain();

  return useMutation({
    mutationFn: async () => {
      if (
        params.inputToken !== ZERO_ADDRESS &&
        params.shouldApprove &&
        !params.gaslessSignature
      ) {
        const signatureOrHash = await params.approveInputToken();
        return signatureOrHash;
      }

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

      const transaction = {
        to: portalQuote.tx.to,
        from: portalQuote.tx.from,
        data: portalQuote.tx.data,
        gasLimit: portalQuote.tx.gasLimit,
        value: portalQuote.tx.value,
      };

      const hash = await sendTransactionAsync({
        to: transaction.to,
        data: transaction.data,
        value: transaction.value,
      });

      console.log("Transaction sent:", hash);

      return { hash, portalQuote };
    },
    onError: (error) => {
      console.log(`Error executing zap through portal: ${error}`);
    },
  });
};

export const usePortalZap = (params: PortalQuoteParams) => {
  const { mutateAsync } = useSendPortalTransaction(params);

  return { mutateAsync };
};
