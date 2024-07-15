import { wagmiConfig } from "@/components/providers/Web3Provider";
import { toast } from "sonner";
import { WaitForTransactionReceiptTimeoutError } from "viem";
import { UsePublicClientReturnType, UseWriteContractParameters } from "wagmi";

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
}: MutationCallbackArgs): UseWriteContractParameters["mutation"] =>
  ({
    onSuccess: (hash) => {
      addRecentTransaction({
        hash,
        description: action,
      });
      const miningPromise = publicClient.waitForTransactionReceipt({
        hash,
      });
      toast.promise(miningPromise, {
        loading: `Pending ${action}...`,
        success: `${action} confirmed`,
        error: (e) => {
          return e instanceof WaitForTransactionReceiptTimeoutError
            ? `We could not confirm your ${action.toLowerCase()}. Please check your wallet.`
            : `${action} failed`;
        },
      });
    },
    onError: (error) => {
      toast.error(`${action} failed`, {
        description: error.message,
      });
    },
  }) as const;
