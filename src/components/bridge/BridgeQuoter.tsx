import { forwardRef } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { m, useReducedMotion } from "framer-motion";

import { BridgeQuote } from "./lib/constants";
import { LoadingBar } from "../common/LoadingBar";
import { formatNumber } from "@/utils/number";
import { cn } from "@/utils/cn";
import { useEthPrice, useGetTokenPrice } from "@/lib/queries/useTokenPrice";
import { useSettings } from "../providers/SettingsProvider";

const variants = {
  hidden: {
    x: 100,
    opacity: 0,
    scale: 0.9,
  },
  visible: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: {
    x: 100,
    opacity: 0,
    scale: 0.9,
  },
};

const reducedMotionVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

export const BridgeQuoter = forwardRef<
  HTMLDivElement,
  {
    originTokenSymbol: string | undefined;
    originTokenAddress: `0x${string}`;
    selectedQuoteProvider: string | undefined;
    updateQuote: (quote: BridgeQuote | undefined) => void;
    quotes: UseQueryResult<BridgeQuote>[];
  }
>(
  (
    {
      selectedQuoteProvider,
      originTokenSymbol,
      originTokenAddress,
      updateQuote,
      quotes,
    },
    ref,
  ) => {
    const isReducedMotion = useReducedMotion();
    const { currency } = useSettings();
    const { data: ethPrice } = useEthPrice();
    const { data: originTokenPrice } = useGetTokenPrice(originTokenAddress);
    const costs = quotes.map((quote) => {
      if (quote.data?.provider === "Connext" && originTokenPrice) {
        return +quote.data.fee * originTokenPrice;
      }
      if (quote.data?.provider === "Wormhole" && ethPrice) {
        return +quote.data.fee * ethPrice;
      }
      return 0;
    });
    return (
      <m.div
        ref={ref}
        variants={isReducedMotion ? reducedMotionVariants : variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ ease: [0.165, 0.84, 0.44, 1], duration: 0.3 }}
        className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 relative max-h-[392px] min-w-60 space-y-4 rounded-md border p-5"
      >
        <h1>Select a bridge quote</h1>
        {quotes.length === 0 && (
          <p>
            No quotes available.
            <br />
            Try to quote in
            <br />
            <a
              href="https://bridge.connext.network/ALCHEMIX-from-linea-to-arbitrum"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Connext UI
            </a>
          </p>
        )}
        {quotes.length > 0 &&
          quotes.map(({ data, isLoading }, i) => (
            <m.div
              role="button"
              tabIndex={0}
              aria-label="Select quote"
              key={`${data?.provider}-${i}`}
              className={cn(
                "bg-grey10inverse dark:bg-grey10 flex min-h-32 flex-col justify-center rounded-md px-6 py-4 hover:cursor-pointer",
                "shadow-[0px_0px_0px_1px_rgba(9,9,11,0.1),0px_1px_2px_-1px_rgba(9,9,11,0.08),0px_2px_4px_0px_rgba(9,9,11,0.04)]",
                "dark:shadow-[0px_0px_0px_1px_rgba(100,100,100,0.1),0px_1px_2px_-1px_rgba(100,100,100,0.1),0px_2px_4px_0px_rgba(100,100,100,0.08)]",
                "focus-within:bg-grey15inverse hover:bg-grey15inverse dark:focus-within:bg-grey15 dark:hover:bg-grey15 transition-colors",
                isLoading && "items-center",
                selectedQuoteProvider === data?.provider &&
                  "bg-grey15inverse dark:bg-grey15",
              )}
              whileTap={{ scale: 0.95, transition: { ease: "linear" } }}
              onClick={() => updateQuote(data)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  updateQuote(data);
                }
              }}
            >
              {isLoading && <LoadingBar />}
              {/* 
                NOTE: Connext takes cost in bridging token.
                Wormhole takes cost always in ETH (not deployed on Metis).
                useEthPrice doesn't adhere to currency setting (1ETH = 1ETH).
              */}
              {!isLoading && (
                <>
                  <p>{data?.provider}</p>
                  <p className="font-medium">
                    {formatNumber(data?.amountOut, {
                      decimals: 6,
                    })}{" "}
                    {originTokenSymbol}
                  </p>
                  <p className="text-sm">
                    Cost{" "}
                    {formatNumber(data?.fee, {
                      decimals: 4,
                    })}{" "}
                    {data?.provider === "Connext" ? originTokenSymbol : "ETH"}
                  </p>
                  {data?.provider === "Connext" ? (
                    <p className="text-xs">
                      ≈ {formatNumber(costs[i], { isCurrency: true, currency })}
                    </p>
                  ) : (
                    <p className="text-xs">≈ ${formatNumber(costs[i])}</p>
                  )}
                </>
              )}
            </m.div>
          ))}
      </m.div>
    );
  },
);

BridgeQuoter.displayName = "BridgeQuoter";
