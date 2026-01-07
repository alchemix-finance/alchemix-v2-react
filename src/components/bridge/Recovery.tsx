import { useCallback, useState } from "react";
import { useSwitchChain } from "wagmi";
import {
  AnimatePresence,
  MotionConfig,
  m,
  useReducedMotion,
} from "framer-motion";
import { mainnet } from "viem/chains";

import { reducedMotionAccordionVariants } from "@/lib/motion/motion";
import { SYNTH_ASSETS_ADDRESSES } from "@/lib/config/synths";
import { formatNumber } from "@/utils/number";
import { CtaButton } from "@/components/common/CtaButton";
import { RecoverBridgeOutModal } from "@/components/modals/RecoverBridgeOutModal";
import { useChain } from "@/hooks/useChain";
import { ALCX_MAINNET_ADDRESS } from "@/lib/constants";

import { useExchangeXAlAsset } from "./lib/mutations";
import { useExchangeQuote } from "./lib/queries";
import { targetMapping } from "./lib/constants";

const accordionVariant = {
  collapsed: { opacity: 0, y: -10 },
  open: { opacity: 1, y: 0 },
};

const X_AL_USD_ADDRESS =
  targetMapping[mainnet.id][SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD];
const X_AL_ETH_ADDRESS =
  targetMapping[mainnet.id][SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH];
const X_ALCX_ADDRESS = targetMapping[mainnet.id][ALCX_MAINNET_ADDRESS];

export const Recovery = ({
  onBridgeReceipt: outer_onBridgeReceipt,
}: {
  onBridgeReceipt: (hash: `0x${string}`) => void;
}) => {
  const isReducedMotion = useReducedMotion();
  const { switchChain } = useSwitchChain();
  const chain = useChain();

  const [openRecoverBridgeOutXAlUsd, setOpenRecoverBridgeOutXAlUsd] =
    useState(false);
  const [openRecoverBridgeOutXAlEth, setOpenRecoverBridgeOutXAlEth] =
    useState(false);
  const [openRecoverBridgeOutXAlcx, setOpenRecoverBridgeOutXAlcx] =
    useState(false);

  const { data: exchangeQuote, refetch: refetchExchangeQuote } =
    useExchangeQuote();

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
  const {
    isPendingExchange: isPendingExchangeAlcx,
    writeExchange: writeExchangeAlcx,
  } = useExchangeXAlAsset({
    quote: exchangeQuote?.ALCX,
  });

  const onBridgeReceipt = useCallback(
    (hash: `0x${string}`) => {
      outer_onBridgeReceipt(hash);
      refetchExchangeQuote();
      setOpenRecoverBridgeOutXAlUsd(false);
      setOpenRecoverBridgeOutXAlEth(false);
      setOpenRecoverBridgeOutXAlcx(false);
    },
    [outer_onBridgeReceipt, refetchExchangeQuote],
  );

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

  const onWriteExchangeAlcx = () => {
    if (!exchangeQuote) {
      return;
    }
    if (exchangeQuote.ALCX.tx.chainId !== chain.id) {
      switchChain({
        chainId: exchangeQuote.ALCX.tx.chainId,
      });
      return;
    }

    writeExchangeAlcx();
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
                )}{" "}
                alUSD.
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
            <CtaButton
              variant="secondary"
              width="full"
              onClick={() => setOpenRecoverBridgeOutXAlUsd(true)}
            >
              Bridge back
            </CtaButton>
            <RecoverBridgeOutModal
              amount={exchangeQuote.alUSD.xAlAssetBalanceFormatted}
              open={openRecoverBridgeOutXAlUsd}
              onOpenChange={setOpenRecoverBridgeOutXAlUsd}
              xAlAssetAddress={X_AL_USD_ADDRESS}
              alAssetAddress={SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD}
              originTokenSymbol="xalUSD"
              onBridgeReceipt={onBridgeReceipt}
            />
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
                )}{" "}
                alETH.
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
            <CtaButton
              variant="secondary"
              width="full"
              onClick={() => setOpenRecoverBridgeOutXAlEth(true)}
            >
              Bridge back
            </CtaButton>
            <RecoverBridgeOutModal
              amount={exchangeQuote.alETH.xAlAssetBalanceFormatted}
              open={openRecoverBridgeOutXAlEth}
              onOpenChange={setOpenRecoverBridgeOutXAlEth}
              xAlAssetAddress={X_AL_ETH_ADDRESS}
              alAssetAddress={SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH}
              originTokenSymbol="xalETH"
              onBridgeReceipt={onBridgeReceipt}
            />
          </m.div>
        )}
        {!!exchangeQuote && exchangeQuote.ALCX.xAlAssetBalance > 0n && (
          <m.div
            layout={!isReducedMotion}
            key="exchangeXAlcx"
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
                {formatNumber(exchangeQuote.ALCX.xAlAssetBalanceFormatted)}{" "}
                xALCX in your wallet. This is an xAsset, which can be exchanged
                for the native asset when liquidity is available. Current
                liquidity is{" "}
                {formatNumber(
                  exchangeQuote.ALCX.alAssetLockboxLiquidityFormatted,
                )}{" "}
                ALCX.
              </p>
            </div>
            <CtaButton
              variant="secondary"
              width="full"
              disabled={
                isPendingExchangeAlcx ||
                !exchangeQuote.ALCX.xAlAssetBalance ||
                exchangeQuote.ALCX.alAssetLockboxLiquidity <
                  exchangeQuote.ALCX.xAlAssetBalance
              }
              onClick={onWriteExchangeAlcx}
            >
              {chain.id !== exchangeQuote.ALCX.tx.chainId
                ? "Switch chain"
                : isPendingExchangeAlcx
                  ? "Preparing"
                  : "Exchange xALCX"}
            </CtaButton>
            <CtaButton
              variant="secondary"
              width="full"
              onClick={() => setOpenRecoverBridgeOutXAlcx(true)}
            >
              Bridge back
            </CtaButton>
            <RecoverBridgeOutModal
              amount={exchangeQuote.ALCX.xAlAssetBalanceFormatted}
              open={openRecoverBridgeOutXAlcx}
              onOpenChange={setOpenRecoverBridgeOutXAlcx}
              xAlAssetAddress={X_ALCX_ADDRESS}
              alAssetAddress={ALCX_MAINNET_ADDRESS}
              originTokenSymbol="xALCX"
              onBridgeReceipt={onBridgeReceipt}
            />
          </m.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
};
