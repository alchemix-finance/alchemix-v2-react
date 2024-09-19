import { lazy, Suspense } from "react";

import { Button } from "@/components/ui/button";

import { VideoModal } from "./VideoModal";
import { BlurInHeader, BlurInParagraph } from "./BlurInText";
import { LandingCtaButton } from "./LandingCtaButton";
import { SlideBox } from "./SlideBox";
import { Tokens } from "./Tokens";
import { EcosystemGrid } from "./EcosystemGrid";
import { Step } from "./Step";
import { useBreakpoints } from "@/hooks/useBreakpoints";

const Scene = lazy(() =>
  import("./particles/Scene").then((module) => ({
    default: module.Scene,
  })),
);

const ActionsList = lazy(() =>
  import("./ActionsList").then((module) => ({ default: module.ActionsList })),
);

export const Landing = () => {
  const { belowBreakpoint } = useBreakpoints();
  return (
    <>
      {/* Only render Particles on desktop */}
      {!belowBreakpoint("xl") && (
        // Particles canvas renders to parent div
        <div className="pointer-events-none fixed inset-0 left-0 top-0 -z-10 h-full w-full lg:pl-[352px]">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>
      )}

      <div className="relative flex flex-col space-y-14 pb-12 font-alcxTitles">
        <div className="flex items-center justify-center gap-16 px-20 py-10">
          <div className="w-1/3 space-y-6">
            <BlurInHeader className="text-6xl font-extrabold" delay={0.1}>
              Self-Repaying Loans, Without The Liquidations
            </BlurInHeader>
            <BlurInParagraph
              className="text-3xl text-lightgrey10inverse dark:text-lightgrey10"
              delay={0.2}
            >
              Alchemix loans automatically pay themselves off without risk of
              liquidation. Unlock the potential of your assets with secure and
              stress-free borrowing.
            </BlurInParagraph>
            <LandingCtaButton delay={0.2} />
          </div>
          <VideoModal
            delay={0.3}
            className="flex w-full items-center justify-center"
          />
        </div>
        <div className="flex flex-col gap-14">
          <BlurInHeader className="pl-20 text-4xl font-semibold" delay={0.3}>
            Why Alchemix?
          </BlurInHeader>
          <div className="flex items-center gap-24 px-20">
            <SlideBox direction="left" className="w-full">
              <Suspense fallback={<div className="h-64 w-full" />}>
                <ActionsList />
              </Suspense>
            </SlideBox>
            <SlideBox className="space-y-6" direction="bottom">
              <h2 className="text-2xl font-semibold">Completely Flexible</h2>
              <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                Alchemix gives you full control of your finances with no hidden
                fees. Repay on your terms, keep your assets working for you, and
                borrow against your collateral to secure future yield.
              </p>
              <Button size="sm" className="uppercase">
                Exlore our vaults
              </Button>
            </SlideBox>
          </div>
          <div className="flex items-center gap-24 px-20">
            <SlideBox className="space-y-6" direction="bottom">
              <h2 className="text-2xl font-semibold">Zero Liquidations</h2>
              <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                With Alchemix, market volatility won&apos;t touch your vault.
                Your debt is securely tied to your collateral, ensuring that
                price swings never put you at risk.
              </p>
              <Button size="sm" className="uppercase">
                Learn more
              </Button>
            </SlideBox>
            <SlideBox
              className="flex w-full items-center justify-center p-6"
              direction="right"
            >
              <img
                src="/images/landing-page/liquidations.png"
                alt="Liquidations section image"
                className="h-64 w-64"
              />
            </SlideBox>
          </div>
          <div className="flex w-full max-w-none items-center gap-24 rounded-sm bg-grey10inverse px-20 dark:bg-grey10">
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Security First</h2>
              <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                We are the original battle-tested DeFi platform with a priority
                of asset protection. As a pioneer in DeFi, we ensure your assets
                are preserved at every step.
              </p>
              <Button size="sm" className="uppercase">
                Explore our audits
              </Button>
            </div>
            <div className="flex w-full items-center justify-center p-6">
              <img
                src="/images/landing-page/lock.svg"
                alt="Lock vector image"
                className="h-64 w-64"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-14 px-20 text-center">
          <div>
            <BlurInHeader className="text-4xl font-bold">
              Your Favorite Tokens
            </BlurInHeader>
            <BlurInParagraph
              className="text-xl text-lightgrey10inverse dark:text-lightgrey10"
              delay={0.2}
            >
              Borrow up to 50% of your collateral
            </BlurInParagraph>
          </div>
          <Tokens />
          <div className="relative -mr-20 grid text-start *:col-start-1 *:row-start-1">
            <div className="pointer-events-none -z-10 w-full pl-64">
              <img
                src="/images/landing-page/big_placeholder.png"
                alt="Placeholder image"
                className="h-full w-full"
              />
            </div>
            <div className="flex size-full max-w-xl flex-col justify-center gap-6">
              <BlurInHeader className="text-4xl font-semibold">
                Get Started With Alchemix
              </BlurInHeader>
              <BlurInParagraph className="text-xl font-semibold text-lightgrey10inverse dark:text-lightgrey10">
                Alchemix&apos;s self-repaying loans automatically pay themselves
                off using the interest earned on your initial deposit. Borrow
                against your assets, earn yield on the full deposit amount, and
                enjoy the ability to spend and save at the same time.
              </BlurInParagraph>
              <LandingCtaButton />
            </div>
          </div>
          <div className="flex items-stretch justify-between gap-20">
            <Step
              src="/images/landing-page/1.png"
              srcHover="/images/landing-page/1-hover.png"
            />
            <Step
              src="/images/landing-page/2.png"
              srcHover="/images/landing-page/2-hover.png"
            />
            <Step
              src="/images/landing-page/3.png"
              srcHover="/images/landing-page/3-hover.png"
            />
          </div>
          <div className="space-y-8 text-start">
            <h2 className="text-center text-4xl font-semibold">
              A Thriving Ecosystem
            </h2>
            <EcosystemGrid />
          </div>
        </div>
      </div>
    </>
  );
};
