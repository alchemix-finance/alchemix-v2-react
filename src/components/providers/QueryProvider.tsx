import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (e, q) => {
      if (process.env.NODE_ENV === "production") return;
      console.log("Error in query", q.queryKey);
      console.error(e);
    },
  }),
  defaultOptions: {
    queries: {
      queryKeyHashFn: (queryKey) => {
        return JSON.stringify(queryKey, (_key, value) =>
          typeof value === "bigint" ? value.toString() : value,
        );
      },
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
};
