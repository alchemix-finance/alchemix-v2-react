// import { lazy, Suspense } from "react";

import { Button } from "@/components/ui/button";

// import { GridPattern } from "./GridPattern";
import { VideoModal } from "./VideoModal";
import { BlurInHeader, BlurInParagraph } from "./BlurInText";
import { LandingCtaButton } from "./LandingCtaButton";
import { SlideBox } from "./SlideBox";
import { Tokens } from "./Tokens";
import { EcosystemGrid } from "./EcosystemGrid";
// import { useBreakpoints } from "@/hooks/useBreakpoints";

// const Scene = lazy(() =>
//   import("./particles/Scene").then((module) => ({
//     default: module.Scene,
//   })),
// );

// const ActionsList = lazy(() =>
//   import("./ActionsList").then((module) => ({ default: module.ActionsList })),
// );

export const Landing = () => {
  // const { belowBreakpoint } = useBreakpoints();
  return (
    <>
      {/* Only render Particles on desktop */}
      {/* {!belowBreakpoint("xl") && (
        // Particles canvas renders to parent div
        <div className="pointer-events-none fixed inset-0 left-0 top-0 -z-10 h-full w-full lg:pl-[352px]">
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </div>
      )} */}

      <div className="relative flex flex-col items-center space-y-0 font-alcxTitles">
        <div className="flex flex-col items-center justify-center gap-4 px-20 py-12">
          <div className="flex flex-1 flex-col items-center justify-center space-y-8 py-8 text-center">
            <BlurInHeader
              className="-mb-4 bg-gradient-to-br from-bronze4 via-bronze3 to-bronze4 bg-clip-text text-[72px] font-extrabold leading-tight tracking-normal text-transparent dark:bg-gradient-to-r dark:from-bronze1 dark:via-neutral-200 dark:to-bronze2"
              delay={0.1}
            >
              Self-Repaying Loans,
              <br />
              Without Liquidations
            </BlurInHeader>
            <BlurInParagraph
              className="text-2xl text-lightgrey10inverse dark:text-lightgrey10"
              delay={0.2}
            >
              Alchemix loans automatically pay themselves off without
              <br />
              risk of liquidation. Unlock the potential of your assets with
              <br />
              secure and stress-free borrowing.
            </BlurInParagraph>
            <div className="flex items-center justify-center gap-4">
              <LandingCtaButton delay={0.2} />
              <VideoModal delay={0.3} className="ml-2" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-12 bg-gradient-to-br from-lightgrey5inverse to-lightgrey10inverse pt-12 dark:from-[#0B0D12] dark:to-[#171B24]">
          <div className="flex items-center gap-4 px-20">
            <div className="flex-1">
              <img
                src="images/landing-page/01_Flexible.png"
                alt="Description of the image"
                className="h-auto w-full"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            <SlideBox className="flex-1 space-y-6" direction="bottom">
              <h2 className="-mb-4 text-[58px] font-semibold">
                Completely Flexible
              </h2>
              <p className="pr-8 text-2xl text-lightgrey10inverse dark:text-lightgrey10">
                Alchemix gives you full control of your finances with no hidden
                fees. Repay on your terms, keep your assets working for you, and
                borrow against your collateral to secure future yield.
              </p>
              <Button
                variant="cta"
                size="cta"
                className="rounded-xl bg-[#0B0D12] text-xl font-medium uppercase"
              >
                Explore our vaults
              </Button>
            </SlideBox>
          </div>

          <div className="flex items-center gap-4 px-20 pb-12">
            <div className="flex-1 space-y-6 pl-8">
              <h2 className="-mb-4 text-[58px] font-semibold">
                Zero Liquidations
              </h2>
              <p className="text-2xl text-lightgrey10inverse dark:text-lightgrey10">
                With Alchemix, market volatility won&apos;t touch your vault.
                Your debt is securely tied to your collateral, ensuring that
                price swings never put you at risk.
              </p>
              <Button
                variant="cta"
                size="cta"
                className="rounded-xl bg-[#000000] text-xl font-medium uppercase"
              >
                Learn more
              </Button>
            </div>

            <div className="flex-1">
              <img
                src="images/landing-page/02_NoLiquidations.png"
                alt="Zero Liquidations"
                className="h-auto w-full"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
          </div>
        </div>
        <div className="flex w-full items-center gap-4 rounded-sm bg-[#0B0D12] px-20 py-12">
          <div className="flex-1 space-y-6 pl-8">
            <h2 className="-mb-4 text-[58px] font-semibold">Security First</h2>
            <p className="text-2xl text-lightgrey10inverse dark:text-lightgrey10">
              We are the original battle-tested DeFi platform with a priority of
              asset protection. As a pioneer in DeFi, we ensure your assets are
              preserved at every step.
            </p>
            <Button
              variant="cta"
              size="cta"
              className="rounded-xl bg-[#0B0D12] text-xl font-medium uppercase"
            >
              Explore our audits
            </Button>
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full rounded">
              <img
                src="/alchemix-v2-react/images/landing-page/03_Padlock.png"
                alt="Lock vector image"
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
        <div className="z-0 flex flex-col gap-14 bg-gradient-to-br from-lightgrey5inverse to-lightgrey10inverse px-20 py-24 text-center dark:from-[#0B0D12] dark:to-[#171B24]">
          <div>
            <BlurInHeader className="text-5xl font-bold">
              Your Favorite Tokens (SECTION FOR TORBIK)
            </BlurInHeader>
            <BlurInParagraph
              className="pb-8 text-2xl text-lightgrey10inverse dark:text-lightgrey10"
              delay={0.2}
            >
              Borrow up to 50% of your collateral
            </BlurInParagraph>
          </div>
          <Tokens />

          <div className="flex w-full items-center gap-4 px-0 py-48">
            <div className="flex-1 space-y-6 pl-8 text-left">
              <BlurInHeader className="-mb-4 whitespace-nowrap text-[58px] font-semibold">
                Get Started With Alchemix
              </BlurInHeader>
              <BlurInParagraph className="text-2xl font-semibold text-lightgrey10inverse dark:text-lightgrey10">
                Alchemix&apos;s self-repaying loans automatically pay themselves
                off using the interest earned on your initial deposit. Borrow
                against your assets, earn yield on the full deposit amount, and
                enjoy the ability to spend and save at the same time.
              </BlurInParagraph>
              <LandingCtaButton />
            </div>

            <div className="flex flex-1 items-center justify-center">
              <img
                src="./images/landing-page/AlchemixLogoPlaceholder.png"
                alt="Alchemix"
                className="rounded-full"
                style={{ width: "300px", height: "300px" }}
              />
            </div>
          </div>
          <div className="-mt-24 flex flex-col items-stretch justify-center gap-4 lg:flex-row">
            <div className="relative">
              <img
                src="/alchemix-v2-react/images/landing-page/1.png"
                alt="Deposit"
                className="h-full w-full rounded-3xl object-contain transition-opacity duration-300 ease-in-out"
              />
              <img
                src="/alchemix-v2-react/images/landing-page/1-hover.png"
                alt="Deposit Hover"
                className="absolute inset-0 h-full w-full rounded-3xl object-contain opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
              />
            </div>
            <div className="relative">
              <img
                src="/alchemix-v2-react/images/landing-page/2.png"
                alt="Earn"
                className="h-full w-full rounded-3xl object-contain transition-opacity duration-300 ease-in-out"
              />
              <img
                src="/alchemix-v2-react/images/landing-page/2-hover.png"
                alt="Earn Hover"
                className="absolute inset-0 h-full w-full rounded-3xl object-contain opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
              />
            </div>
            <div className="relative">
              <img
                src="/alchemix-v2-react/images/landing-page/3.png"
                alt="Access"
                className="h-full w-full rounded-3xl object-contain transition-opacity duration-300 ease-in-out"
              />
              <img
                src="/alchemix-v2-react/images/landing-page/3-hover.png"
                alt="Access Hover"
                className="absolute inset-0 h-full w-full rounded-3xl object-contain opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
              />
            </div>
          </div>
          <div className="space-y-8 pt-8 text-start">
            <h2 className="text-center text-5xl font-semibold">
              A Thriving Ecosystem
            </h2>
            <div className="px-44">
              <EcosystemGrid />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
