import { UseMutationOptions } from "@tanstack/react-query";
import {
  SendTransactionErrorType,
  SendTransactionParameters,
  SendTransactionReturnType,
  WriteContractErrorType,
  WriteContractParameters,
  WriteContractReturnType,
} from "@wagmi/core";
import { toast } from "sonner";
import {
  TransactionNotFoundError,
  WaitForTransactionReceiptTimeoutError,
} from "viem";
import { UsePublicClientReturnType } from "wagmi";

import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";

interface MutationCallbackArgs {
  action: string;
  addRecentTransaction: (transaction: {
    hash: string;
    description: string;
  }) => void;
  publicClient: UsePublicClientReturnType<typeof wagmiConfig>;
}

export const mutationCallback = ({
  action,
  addRecentTransaction,
  publicClient,
}: MutationCallbackArgs): UseMutationOptions<
  WriteContractReturnType | SendTransactionReturnType,
  WriteContractErrorType | SendTransactionErrorType,
  WriteContractParameters | SendTransactionParameters
> =>
  ({
    onSuccess: (hash) => {
      addRecentTransaction({
        hash,
        description: action,
      });
      const executionPromise = () =>
        new Promise((resolve, reject) => {
          publicClient
            .waitForTransactionReceipt({
              hash,
            })
            .then((receipt) =>
              receipt.status === "success"
                ? resolve(receipt)
                : reject(new Error("Transaction reverted")),
            );
        });
      toast.promise(executionPromise, {
        loading: `Pending ${action}...`,
        success: `${action} confirmed`,
        error: (e) => {
          const actionWithFirstLetterLowercased =
            action.charAt(0).toLowerCase() + action.slice(1);

          if (
            e instanceof WaitForTransactionReceiptTimeoutError ||
            e instanceof TransactionNotFoundError
          ) {
            return `We could not confirm your ${actionWithFirstLetterLowercased}. Please check your wallet.`;
          }

          if (e instanceof Error) {
            return `${action} failed: ${e.message}`;
          }

          return `${action} failed`;
        },
      });
    },
    onError: (error) => {
      toast.error(`${action} failed`, {
        description: error.message.includes("User rejected the request")
          ? "Transaction rejected by user"
          : error.message,
      });
    },
  }) as const;
