import { ScopeKey } from "@/lib/queries/queriesSchema";
import type { Query, QueryKey } from "@tanstack/react-query";

interface InvalidateWagmiUseQueryArgs {
  query: Query<unknown, Error, unknown, QueryKey>;
  scopeKey: ScopeKey;
}

export const invalidateWagmiUseQuery = ({
  query,
  scopeKey,
}: InvalidateWagmiUseQueryArgs) => {
  const wagmiOptions = query.queryKey[1];
  return (
    typeof wagmiOptions === "object" &&
    !!wagmiOptions &&
    "scopeKey" in wagmiOptions &&
    wagmiOptions.scopeKey === scopeKey
  );
};
