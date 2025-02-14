import { UseQueryResult, useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import { BridgeQuote, SupportedBridgeChainIds } from "./constants";
import { SupportedChainId, wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { getConnexQuoteQueryOptions } from "./connext";
import { getWormholeQuoteQueryOptions, useBridgeLimit } from "./wormhole";

const combine = (quotes: UseQueryResult<BridgeQuote>[]) => ({
  quotes: quotes
    .filter(
      (quote) =>
        !quote.isError &&
        !(quote.data?.provider === "Wormhole" && quote.data.isLimitExceeded),
    )
    .sort((a, b) => {
      if (!a.data && !b.data) return 0;

      if (!a.data) return 1;
      if (!b.data) return -1;

      return +b.data.amountOut - +a.data.amountOut;
    }),
  showQuotes: quotes.some((q) => q.isError || q.isLoading || q.isSuccess),
});

export const useBridgeQuotes = ({
  originChainId,
  destinationChainId,
  originTokenAddress,
  amount,
  slippage,
}: {
  originChainId: SupportedChainId;
  destinationChainId: SupportedBridgeChainIds;
  originTokenAddress: `0x${string}`;
  amount: string;
  slippage: string;
}) => {
  const [selectedQuoteProvider, setSelectedQuoteProvider] =
    useState<BridgeQuote["provider"]>();

  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: originChainId,
  });

  const { address = zeroAddress } = useAccount();

  const { data: bridgeLimit } = useBridgeLimit({
    destinationChainId,
    originTokenAddress,
  });

  const { quotes, showQuotes } = useQueries({
    queries: [
      getWormholeQuoteQueryOptions({
        originChainId,
        destinationChainId,
        bridgeLimit,
        originTokenAddress,
        amount,
        address,
        publicClient,
      }),
      getConnexQuoteQueryOptions({
        originChainId,
        destinationChainId,
        originTokenAddress,
        amount,
        slippage,
        address,
        publicClient,
      }),
    ],
    combine,
  });

  useEffect(() => {
    setSelectedQuoteProvider(undefined);
  }, [originChainId, destinationChainId, originTokenAddress, amount, slippage]);

  useEffect(() => {
    if (!selectedQuoteProvider) return;
    if (!quotes.some((q) => q.data?.provider === selectedQuoteProvider)) {
      setSelectedQuoteProvider(undefined);
    }
  }, [selectedQuoteProvider, quotes]);

  const quote = quotes.find(
    (q) => q.data?.provider === selectedQuoteProvider,
  )?.data;

  return {
    quotes,
    showQuotes,
    quote,
    selectedQuoteProvider,
    setSelectedQuoteProvider,
  };
};
