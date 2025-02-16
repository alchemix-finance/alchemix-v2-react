import { forwardRef } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { m, useReducedMotion } from "framer-motion";

import { BridgeQuote } from "./lib/constants";
import { LoadingBar } from "../common/LoadingBar";
import { formatNumber } from "@/utils/number";
import { cn } from "@/utils/cn";

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
    selectedQuoteProvider: string | undefined;
    updateQuote: (quote: BridgeQuote | undefined) => void;
    quotes: UseQueryResult<BridgeQuote>[];
  }
>(({ selectedQuoteProvider, originTokenSymbol, updateQuote, quotes }, ref) => {
  const isReducedMotion = useReducedMotion();
  return (
    <m.div
      ref={ref}
      variants={isReducedMotion ? reducedMotionVariants : variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ ease: [0.165, 0.84, 0.44, 1], duration: 0.3 }}
      className="relative min-w-56 space-y-4 rounded-md border border-grey10inverse bg-grey15inverse p-5 dark:border-grey10 dark:bg-grey15"
    >
      {quotes.map(({ data, isLoading }, i) => (
        <m.div
          role="button"
          tabIndex={0}
          aria-label="Select quote"
          key={`${data?.provider}-${i}`}
          className={cn(
            "flex min-h-28 flex-col justify-center rounded-md bg-grey10inverse px-6 py-4 hover:cursor-pointer dark:bg-grey10",
            "shadow-[0px_0px_0px_1px_rgba(9,9,11,0.1),0px_1px_2px_-1px_rgba(9,9,11,0.08),0px_2px_4px_0px_rgba(9,9,11,0.04)]",
            "dark:shadow-[0px_0px_0px_1px_rgba(100,100,100,0.1),0px_1px_2px_-1px_rgba(100,100,100,0.1),0px_2px_4px_0px_rgba(100,100,100,0.08)]",
            "transition-colors focus-within:bg-grey15inverse hover:bg-grey15inverse dark:focus-within:bg-grey15 dark:hover:bg-grey15",
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
                Fee{" "}
                {formatNumber(data?.fee, {
                  decimals: 4,
                })}{" "}
                ETH
              </p>
            </>
          )}
        </m.div>
      ))}
    </m.div>
  );
});

BridgeQuoter.displayName = "BridgeQuoter";
