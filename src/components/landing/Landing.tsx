import { lazy, Suspense } from "react";
import { FileIcon } from "lucide-react";

import XPrevTwitterIcon from "@/assets/logos/x.svg?react";
import DiscordIcon from "@/assets/logos/discord.svg?react";
import { Button } from "@/components/ui/button";

import { VideoModal } from "./VideoModal";
import { BlurInHeader, BlurInParagraph } from "./BlurInText";
import { LandingCtaButton } from "./LandingCtaButton";
import { SlideBox } from "./SlideBox";
import { Tokens } from "./Tokens";

const Scene = lazy(() =>
  import("./particles/Scene").then((module) => ({
    default: module.Scene,
  })),
);

const ActionsList = lazy(() =>
  import("./ActionsList").then((module) => ({ default: module.ActionsList })),
);

export const Landing = () => {
  return (
    <>
      {/* Particles canvas renders to parent div */}
      <div className="pointer-events-none fixed inset-0 left-0 top-0 -z-10 h-full w-full lg:pl-[352px]">
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      <div className="relative flex flex-col space-y-14 pb-12 font-alcxTitles">
        <div className="flex items-center justify-between gap-16 px-20 py-10">
          <div className="space-y-6">
            <BlurInHeader className="text-4xl font-extrabold" delay={0.1}>
              Self-Repaying Loans, Without The Liquidations
            </BlurInHeader>
            <BlurInParagraph
              className="text-xl text-lightgrey10inverse dark:text-lightgrey10"
              delay={0.2}
            >
              Alchemix loans automatically pay themselves off without risk of
              liquidation. Unlock the potential of your assets with secure and
              stress-free borrowing.
            </BlurInParagraph>
            <LandingCtaButton delay={0.3} />
          </div>
          <VideoModal animateInDelay={0.3} />
        </div>
        <div className="flex flex-col gap-14 px-20">
          <BlurInHeader className="text-3xl font-semibold" delay={0.5}>
            Why Alchemix?
          </BlurInHeader>
          <div className="flex items-center gap-24">
            <SlideBox direction="left" className="w-full" delay={0.6}>
              <Suspense fallback={<div className="h-64 w-full" />}>
                <ActionsList />
              </Suspense>
            </SlideBox>
            <SlideBox className="space-y-6" direction="bottom" delay={0.6}>
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
          <div className="flex items-center gap-24">
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
          <div className="flex items-center gap-24">
            <SlideBox className="space-y-6" direction="bottom">
              <h2 className="text-2xl font-semibold">Security First</h2>
              <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                We are the original battle-tested DeFi platform with a priority
                of asset protection. As a pioneer in DeFi, we ensure your assets
                are preserved at every step.
              </p>
              <Button size="sm" className="uppercase">
                Explore our audits
              </Button>
            </SlideBox>
            <SlideBox
              className="flex w-full items-center justify-center p-6"
              direction="right"
            >
              <img
                src="/images/landing-page/lock.svg"
                alt="Lock vector image"
                className="h-64 w-64"
                loading="lazy"
              />
            </SlideBox>
          </div>
        </div>
        <div className="flex flex-col gap-14 px-20 text-center">
          <div>
            <BlurInHeader className="text-3xl font-bold">
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
              <BlurInHeader className="text-3xl font-semibold">
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
            <div className="flex flex-col items-center justify-between gap-10">
              <h5 className="inline-flex items-center gap-2">
                <span className="text-3xl font-semibold">01</span>
                <span className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                  Deposit your assets
                </span>
              </h5>
              <img
                alt="Placeholder image"
                src="/images/landing-page/placeholder.png"
                loading="lazy"
                className="h-40 w-64"
              />
            </div>
            <div className="flex flex-col items-center justify-between gap-10">
              <h5 className="inline-flex items-center gap-2">
                <span className="text-3xl font-semibold">02</span>
                <span className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                  Automatically earn yield
                </span>
              </h5>
              <img
                alt="Placeholder image"
                src="/images/landing-page/placeholder.png"
                loading="lazy"
                className="h-40 w-64"
              />
            </div>
            <div className="flex flex-col items-center justify-between gap-10">
              <h5 className="inline-flex items-center gap-2">
                <span className="text-3xl font-semibold">03</span>
                <span className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                  Access your future yield
                </span>
              </h5>
              <img
                alt="Placeholder image"
                src="/images/landing-page/placeholder.png"
                loading="lazy"
                className="h-40 w-64"
              />
            </div>
          </div>
          <div className="space-y-8 text-start">
            <h2 className="text-center text-4xl font-semibold">
              A Thriving Ecosystem
            </h2>
            <div className="flex items-stretch justify-between gap-7">
              <div className="flex w-full flex-col justify-between gap-10 rounded-2xl border border-lightgrey10inverse p-9 dark:border-lightgrey10">
                <div className="flex items-center justify-center">
                  <DiscordIcon className="h-28 w-28 fill-black2 dark:fill-white2" />
                </div>
                <h5 className="text-3xl font-semibold">Discord</h5>
                <p className="text-lg text-lightgrey10inverse dark:text-lightgrey10">
                  Participate in active Alchemix community discussions and get
                  user support.
                </p>
                <a href="#" className="uppercase">
                  Join Discord
                </a>
              </div>
              <div className="flex w-full flex-col justify-between gap-10 rounded-2xl border border-lightgrey10inverse p-9 dark:border-lightgrey10">
                <div className="flex items-center justify-center">
                  <XPrevTwitterIcon className="h-28 w-28 fill-black2 dark:fill-white2" />
                </div>
                <h5 className="text-3xl font-semibold">Twitter</h5>
                <p className="text-lg text-lightgrey10inverse dark:text-lightgrey10">
                  Stay up to date with the latest Alchemix news and community
                  updates.
                </p>
                <a href="#" className="uppercase">
                  Follow Twitter
                </a>
              </div>
              <div className="flex w-full flex-col justify-between gap-10 rounded-2xl border border-lightgrey10inverse p-9 dark:border-lightgrey10">
                <div className="flex items-center justify-center">
                  <FileIcon className="h-28 w-28" />
                </div>
                <h5 className="text-3xl font-semibold">Documentation</h5>
                <p className="text-lg text-lightgrey10inverse dark:text-lightgrey10">
                  Build with us! Our documentation offers everything you need to
                  get started.
                </p>
                <a href="#" className="uppercase">
                  Read docs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
