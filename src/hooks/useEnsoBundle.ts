import { fantom } from "viem/chains";
import { useChain } from "./useChain";
import { GAS_ADDRESS } from "@/lib/constants";
import { SimulateContractReturnType } from "viem";
import { useMutation, WriteContractMutate } from "wagmi/query";
import { Config, useAccount, useSendTransaction } from "wagmi";

export interface EnsoAction {
  protocol: string;
  action: string;
  args: EnsoActionArg;
}

export interface EnsoActionArg {
  tokenIn: `0x${string}`;
  tokenOut: `0x${string}`;
  amountIn: string | { useOutputOfCallAt: number };
  slippage?: string;
  primaryAddress?: `0x${string}`;
}

export interface EnsoBundleResponse {
  bundle: EnsoAction[];
  gas: string;
  createdAt: string;
  tx: EnsoTx;
}

export interface EnsoTx {
  data: `0x${string}`;
  to: `0x${string}`;
  value: bigint;
}

export interface EnsoBundleConfig {
  actions: EnsoAction[];
  isInputTokenApprovalNeeded?: boolean;
  approveInputTokenConfig?: unknown;
  approveInputToken?: WriteContractMutate<Config, unknown>;
}

export const ENSO_ROUTER_ADDRESS = "0x80EbA3855878739F4710233A8a19d89Bdd2ffB8E";
const ENSO_API_BUNDLE_URI = "https://api.enso.finance/api/v1/shortcuts/bundle";
const ENSO_API_KEY = import.meta.env.VITE_ENSO_API_KEY;

export const useEnsoBundle = ({
  actions,
  isInputTokenApprovalNeeded,
  approveInputTokenConfig,
  approveInputToken,
}: EnsoBundleConfig) => {
  const chain = useChain();
  const { sendTransaction } = useSendTransaction();
  const { address } = useAccount();

  const inputToken = actions.length > 0 ? actions[0].args.tokenIn : null;

  return useMutation({
    mutationFn: async () => {
      if (chain.id !== fantom.id) {
        if (
          inputToken &&
          inputToken !== GAS_ADDRESS &&
          isInputTokenApprovalNeeded &&
          approveInputTokenConfig &&
          approveInputToken
        ) {
          // must approve the token on the router
          approveInputTokenConfig &&
            approveInputToken(
              (approveInputTokenConfig as SimulateContractReturnType).request,
            );
          return;
        }

        const response = await fetch(
          `${ENSO_API_BUNDLE_URI}?chainId=${chain.id}&fromAddress=${address}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${ENSO_API_KEY}`,
            },
            body: JSON.stringify(actions),
          },
        );

        if (!response.ok) {
          throw new Error(
            `Error executing enso api call: ${response.status} ${response.statusText}`,
          );
        }
        const ensoTxData = (await response.json()) as EnsoBundleResponse;

        const result = await sendTransaction({
          data: ensoTxData.tx.data,
          to: ensoTxData.tx.to,
          value: ensoTxData.tx.value,
        });
        console.log("Transaction sent:", result);

        return;
      }
    },
    onSuccess: (data) => {
      console.log("Transaction sent using Enso Bundler:", data);
    },
    onError: (error) => {
      console.error(error);
    },
  });
};
