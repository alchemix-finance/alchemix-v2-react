import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";

import { useChain } from "./useChain";
import { ScopeKey } from "@/lib/queries/queriesSchema";
import { invalidateWagmiUseQueryPredicate } from "@/utils/helpers/invalidateWagmiUseQueryPredicate";

interface UseWatchQueryArgs {
  scopeKey: ScopeKey;
}

export const useWatchQuery = ({ scopeKey }: UseWatchQueryArgs) => {
  const queryClient = useQueryClient();
  const chain = useChain();
  const { data: blockNumber } = useBlockNumber({
    chainId: chain.id,
    watch: true,
  });
  useEffect(() => {
    if (document.visibilityState === "visible") {
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQueryPredicate({ query, scopeKey }),
      });
    }
  }, [blockNumber, chain.id, queryClient, scopeKey]);
};
