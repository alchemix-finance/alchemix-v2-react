import { useBlockNumber } from "wagmi";
import { useChain } from "./useChain";
import { useEffect } from "react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";

export type UseWatchQueryArgs =
  | {
      queryKey: QueryKey;
      queryKeys?: never;
    }
  | {
      queryKeys: QueryKey[];
      queryKey?: never;
    };

export const useWatchQuery = ({ queryKey, queryKeys }: UseWatchQueryArgs) => {
  const queryClient = useQueryClient();
  const chain = useChain();
  const { data: blockNumber } = useBlockNumber({
    chainId: chain.id,
    watch: true,
  });
  useEffect(() => {
    if (blockNumber) {
      if (queryKey) {
        queryClient.invalidateQueries({ queryKey });
        return;
      }
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    }
  }, [blockNumber, queryClient, queryKey, queryKeys]);
};
