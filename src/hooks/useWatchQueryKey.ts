import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";
import { useChain } from "./useChain";
import { useEffect } from "react";

/**
 * Watch a query key and invalidate it every 2 blocks
 * @param queryKey Query key to watch
 * @description This hook is useful when you want to watch balances and keep them up to date.
 * We only invalidate the query every 2 blocks to reduce the number of requests.
 */
export const useWatchQueryKey = (queryKey: QueryKey | QueryKey[]) => {
  const chain = useChain();
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    chainId: chain.id,
    watch: true,
  });
  useEffect(() => {
    if (blockNumber && Number(blockNumber) % 2 === 0) {
      if (Array.isArray(queryKey)) {
        queryKey.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
        return;
      }
      queryClient.invalidateQueries({ queryKey });
    }
  }, [blockNumber, queryClient, queryKey]);
};
