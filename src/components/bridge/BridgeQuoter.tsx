import { forwardRef } from "react";
import { m, useReducedMotion } from "framer-motion";

import { formatNumber } from "@/utils/number";
import { cn } from "@/utils/cn";
import { useEthPrice } from "@/lib/queries/useTokenPrice";
import { LoadingBar } from "@/components/common/LoadingBar";

import { Quote } from "./lib/constants";

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
    quote: Quote | undefined;
    isLoading: boolean;
    isError: boolean;
  }
>(({ originTokenSymbol, quote, isLoading, isError }, ref) => {
  const isReducedMotion = useReducedMotion();
  const { data: ethPrice } = useEthPrice();
  const cost = ethPrice && quote ? +quote.fee * ethPrice : 0;
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
      <div
        className={cn(
          "bg-grey10inverse dark:bg-grey10 flex min-h-32 flex-col justify-center rounded-md px-6 py-4 hover:cursor-pointer",
          "shadow-[0px_0px_0px_1px_rgba(9,9,11,0.1),0px_1px_2px_-1px_rgba(9,9,11,0.08),0px_2px_4px_0px_rgba(9,9,11,0.04)]",
          "dark:shadow-[0px_0px_0px_1px_rgba(100,100,100,0.1),0px_1px_2px_-1px_rgba(100,100,100,0.1),0px_2px_4px_0px_rgba(100,100,100,0.08)]",
          "focus-within:bg-grey15inverse hover:bg-grey15inverse dark:focus-within:bg-grey15 dark:hover:bg-grey15 transition-colors",
        )}
      >
        {isLoading && <LoadingBar />}
        {isError && <p>Couldn&apos;t fetch a quote.</p>}
        {quote && !quote.isLimitExceeded && (
          <>
            <p className="font-medium">
              {formatNumber(quote.amountOut, {
                decimals: 6,
              })}{" "}
              {originTokenSymbol}
            </p>
            <p className="text-sm">
              Cost{" "}
              {formatNumber(quote.fee, {
                decimals: 4,
              })}{" "}
              ETH
            </p>
            <p className="text-xs">≈ ${formatNumber(cost)}</p>
          </>
        )}
        {quote && quote.isLimitExceeded && (
          <p className="text-red-500">
            Amount exceeds the current liquidity for this bridge. Current limit
            is {formatNumber(quote.bridgeLimit)} {originTokenSymbol}.
          </p>
        )}
        {quote && quote.isOriginSizeExceeded && (
          <p>
            Your size is Size. There won&apos;t be enough liquidity to send
            tokens back after Your bridge.
          </p>
        )}
      </div>
    </m.div>
  );
});

BridgeQuoter.displayName = "BridgeQuoter";
