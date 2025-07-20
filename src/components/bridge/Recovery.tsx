import { useSwitchChain } from "wagmi";
import {
  AnimatePresence,
  MotionConfig,
  m,
  useReducedMotion,
} from "framer-motion";

import { reducedMotionAccordionVariants } from "@/lib/motion/motion";
import { formatNumber } from "@/utils/number";
import { CtaButton } from "@/components/common/CtaButton";
import { useChain } from "@/hooks/useChain";

import { useExchangeXAlAsset } from "./lib/mutations";
import { useExchangeQuote } from "./lib/queries";

const accordionVariant = {
  collapsed: { opacity: 0, y: -10 },
  open: { opacity: 1, y: 0 },
};

export const Recovery = () => {
  const isReducedMotion = useReducedMotion();
  const { switchChain } = useSwitchChain();
  const chain = useChain();

  const { data: exchangeQuote } = useExchangeQuote();

  const {
    isPendingExchange: isPendingExchangeAlUsd,
    writeExchange: writeExchangeAlUsd,
  } = useExchangeXAlAsset({
    quote: exchangeQuote?.alUSD,
  });
  const {
    isPendingExchange: isPendingExchangeAlEth,
    writeExchange: writeExchangeAlEth,
  } = useExchangeXAlAsset({
    quote: exchangeQuote?.alETH,
  });

  const onWriteExchangeAlUsdClick = () => {
    if (!exchangeQuote) {
      return;
    }
    if (exchangeQuote.alUSD.tx.chainId !== chain.id) {
      switchChain({
        chainId: exchangeQuote.alUSD.tx.chainId,
      });
      return;
    }

    writeExchangeAlUsd();
  };

  const onWriteExchangeAlEthClick = () => {
    if (!exchangeQuote) {
      return;
    }
    if (exchangeQuote.alETH.tx.chainId !== chain.id) {
      switchChain({
        chainId: exchangeQuote.alETH.tx.chainId,
      });
      return;
    }

    writeExchangeAlEth();
  };

  return (
    <MotionConfig transition={{ type: "spring", duration: 0.35, bounce: 0 }}>
      <AnimatePresence initial={false} mode="popLayout">
        {!!exchangeQuote && exchangeQuote.alUSD.xAlAssetBalance > 0n && (
          <m.div
            layout={!isReducedMotion}
            key="exchangeXAlUsd"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={
              isReducedMotion
                ? reducedMotionAccordionVariants
                : accordionVariant
            }
            className="space-y-4"
          >
            <div>
              <p>
                We have noticed{" "}
                {formatNumber(exchangeQuote.alUSD.xAlAssetBalanceFormatted)}{" "}
                xalUSD in your wallet. This is an xAlAsset, which can be
                exchanged for the native asset when liquidity is available.
                Current liquidity is{" "}
                {formatNumber(
                  exchangeQuote.alUSD.alAssetLockboxLiquidityFormatted,
                )}
                .
              </p>
            </div>
            <CtaButton
              variant="secondary"
              width="full"
              disabled={
                isPendingExchangeAlUsd ||
                !exchangeQuote.alUSD.xAlAssetBalance ||
                exchangeQuote.alUSD.alAssetLockboxLiquidity <
                  exchangeQuote.alUSD.xAlAssetBalance
              }
              onClick={onWriteExchangeAlUsdClick}
            >
              {chain.id !== exchangeQuote.alUSD.tx.chainId
                ? "Switch chain"
                : isPendingExchangeAlUsd
                  ? "Preparing"
                  : "Exchange xalUSD"}
            </CtaButton>
          </m.div>
        )}
        {!!exchangeQuote && exchangeQuote.alETH.xAlAssetBalance > 0n && (
          <m.div
            layout={!isReducedMotion}
            key="exchangeXAlEth"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={
              isReducedMotion
                ? reducedMotionAccordionVariants
                : accordionVariant
            }
            className="space-y-4"
          >
            <div>
              <p>
                We have noticed{" "}
                {formatNumber(exchangeQuote.alETH.xAlAssetBalanceFormatted)}{" "}
                xalETH in your wallet. This is an xAlAsset, which can be
                exchanged for the native asset when liquidity is available.
                Current liquidity is{" "}
                {formatNumber(
                  exchangeQuote.alETH.alAssetLockboxLiquidityFormatted,
                )}
                .
              </p>
            </div>
            <CtaButton
              variant="secondary"
              width="full"
              disabled={
                isPendingExchangeAlEth ||
                !exchangeQuote.alETH.xAlAssetBalance ||
                exchangeQuote.alETH.alAssetLockboxLiquidity <
                  exchangeQuote.alETH.xAlAssetBalance
              }
              onClick={onWriteExchangeAlEthClick}
            >
              {chain.id !== exchangeQuote.alETH.tx.chainId
                ? "Switch chain"
                : isPendingExchangeAlEth
                  ? "Preparing"
                  : "Exchange xalETH"}
            </CtaButton>
          </m.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};
