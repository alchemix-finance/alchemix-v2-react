import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";
import { mainnet } from "viem/chains";

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
      const isEth = chain.id === mainnet.id;
      const isBlockNumberEven = !!blockNumber && Number(blockNumber) % 2 === 0;
      if (isEth || (!isEth && isBlockNumberEven)) {
        queryClient.invalidateQueries({
          predicate: (query) =>
            invalidateWagmiUseQueryPredicate({ query, scopeKey }),
        });
      }
    }
  }, [blockNumber, chain.id, queryClient, scopeKey]);
};
