import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useChain } from "./useChain";
import { usePublicClient } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { useCallback } from "react";
import { mutationCallback } from "@/utils/helpers/mutationCallback";

export const useWriteContractMutationCallback = () => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const addRecentTransaction = useAddRecentTransaction();

  return useCallback(
    ({ action }: { action: string }) =>
      mutationCallback({
        action,
        addRecentTransaction,
        publicClient,
      }),
    [addRecentTransaction, publicClient],
  );
};
