import { VideoModal } from "./VideoModal";
import { BlurInHeader, BlurInParagraph } from "./BlurInText";
import { LandingCtaButton, LandingSubButton } from "./LandingCtaButton";
import { SlideBox } from "./SlideBox";
import { Tokens } from "./Tokens";
import { EcosystemGrid } from "./EcosystemGrid";
import { RiveSection } from "./RiveSection";

export const Landing = () => {
  return (
    <div className="relative flex flex-col items-center font-alcxTitles">
      <div className="relative flex max-w-screen-2xl flex-col items-center justify-center gap-4 p-5 text-center after:absolute after:left-1/2 after:top-3/4 after:-z-10 after:size-1/3 after:-translate-x-1/2 lg:px-10 lg:py-12 2xl:px-20 2xl:py-24 dark:after:bg-green2 dark:after:blur-[256px]">
        <BlurInHeader
          className="bg-gradient-to-br from-bronze1 via-bronze3 to-bronze1 bg-clip-text text-4xl font-extrabold leading-tight tracking-normal text-transparent sm:text-5xl xl:text-7xl dark:bg-gradient-to-r dark:from-bronze1 dark:via-neutral-100 dark:to-bronze1 dark:drop-shadow-[8px_8px_16px_rgba(0,_0,_0,_0.8)]"
          delay={0.1}
        >
          Self-Repaying Loans,
          <br />
          Without Liquidations
        </BlurInHeader>
        <BlurInParagraph
          className="mb-4 mt-2 font-sans font-light leading-snug text-lightgrey10inverse xl:text-xl 2xl:mb-12 2xl:mt-8 dark:text-white"
          delay={0.2}
        >
          Alchemix loans automatically pay themselves off without risk of
          liquidation.
          <br />
          Unlock the potential of your assets with secure and stress-free
          borrowing.
        </BlurInParagraph>
        <div className="flex flex-col items-center justify-center gap-4 xl:flex-row 2xl:gap-6">
          <LandingCtaButton delay={0.2}>
            Get a Self-Repaying Loan
          </LandingCtaButton>
          <VideoModal delay={0.2} />
        </div>
        <div className="absolute left-1/2 top-3/4 -z-10 hidden size-full -translate-x-1/2 bg-[url('/images/landing-page/stars.svg')] bg-contain dark:block" />
      </div>

      <div className="w-full dark:bg-gradient-to-br dark:from-[#0B0D12] dark:to-[#171B24]">
        <div className="mx-auto flex max-w-screen-2xl flex-col gap-4 py-12 2xl:gap-20 2xl:py-20">
          <div className="flex flex-col items-center gap-4 px-5 sm:flex-row lg:px-10 2xl:px-40">
            <SlideBox className="w-full" direction="left" delay={0.2}>
              <img
                src="images/landing-page/flexible.png"
                alt="Three magic vessels"
                className="h-auto w-full"
              />
            </SlideBox>
            <SlideBox
              className="w-full space-y-6"
              direction="bottom"
              delay={0.2}
            >
              <h2 className="text-xl font-semibold 2xl:text-4xl">
                Completely Flexible
              </h2>
              <p className="mb-7 mt-3 font-sans font-light leading-snug text-lightgrey10inverse xl:text-xl dark:text-lightgrey10">
                Alchemix gives you full control of your finances with no hidden
                fees. Repay on your terms, keep your assets working for you, and
                borrow against your collateral to secure future&nbsp;yield.
              </p>
              <LandingSubButton delay={0.2}>
                Explore our vaults
              </LandingSubButton>
            </SlideBox>
          </div>

          <div className="flex flex-col-reverse items-center gap-4 px-5 sm:flex-row lg:px-10 2xl:px-40">
            <div className="w-full space-y-6">
              <h2 className="text-xl font-semibold 2xl:text-4xl">
                Zero Liquidations
              </h2>
              <p className="mb-7 mt-3 font-sans font-light leading-snug text-lightgrey10inverse xl:text-xl dark:text-lightgrey10">
                With Alchemix, market volatility won&apos;t touch your vault.
                Your debt is securely tied to your collateral, ensuring that
                price swings never put you at risk.
              </p>
              <LandingSubButton delay={0.2} href="#">
                Learn more
              </LandingSubButton>
            </div>
            <div className="w-full">
              <img
                src="images/landing-page/no_liquidations.png"
                alt="Zero Liquidations"
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full dark:bg-[#080a0e]">
        <div className="mx-auto flex max-w-screen-2xl flex-col-reverse items-center gap-4 rounded-sm p-5 sm:flex-row lg:px-10 2xl:px-40 2xl:py-20">
          <div className="w-full space-y-6">
            <h2 className="text-xl font-semibold 2xl:text-4xl">
              Security First
            </h2>
            <p className="mb-7 mt-3 font-sans font-light leading-snug text-lightgrey10inverse xl:text-xl dark:text-lightgrey10">
              We are the original battle-tested DeFi platform with a priority of
              asset protection. As a pioneer in DeFi, we ensure your assets are
              preserved at every step.
            </p>
            <LandingSubButton delay={0.2} href="#">
              Explore our audits
            </LandingSubButton>
          </div>
          <div className="w-full">
            <img
              src="/images/landing-page/security.png"
              alt="Lock vector image"
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="w-full dark:bg-[#11141B]">
        <div className="mx-auto flex max-w-screen-2xl flex-col-reverse items-center gap-6 p-5 sm:flex-row lg:px-10 2xl:gap-16 2xl:px-40 2xl:py-20">
          <Tokens />
          <div className="flex w-full flex-col items-center justify-center text-center sm:items-start sm:text-left">
            <BlurInHeader className="text-xl font-semibold 2xl:text-4xl">
              Your Favorite Tokens
            </BlurInHeader>
            <BlurInParagraph
              className="mt-3 text-left font-sans leading-snug text-lightgrey10inverse xl:text-xl dark:text-lightgrey10"
              delay={0.2}
            >
              Borrow up to 50% of your collateral, whist earning yield on your
              full stack.
            </BlurInParagraph>
          </div>
        </div>

        <div className="dark:bg-[#080a0e]">
          <div className="mx-auto flex max-w-screen-2xl flex-col items-center pb-5 2xl:pb-20 dark:bg-[#080a0e]">
            <div className="space-y-4 p-5 text-center 2xl:space-y-10 2xl:p-20">
              <BlurInHeader className="whitespace-nowrap bg-gradient-to-r from-bronze1 via-bronze3 to-bronze1 bg-clip-text text-[24px] font-extrabold text-transparent 2xl:text-[64px] dark:from-bronze1 dark:via-neutral-100 dark:to-bronze1">
                Get started with Alchemix
              </BlurInHeader>
              <BlurInParagraph className="text-xl font-bold leading-tight text-lightgrey10inverse 2xl:whitespace-nowrap 2xl:text-[28px] dark:text-white">
                Alchemix&apos;s self-repaying loans automatically pay themselves
                off using the interest earned
                <br />
                on your initial deposit. Borrow against your assets, earn yield
                on the full deposit amount,
                <br />
                and enjoy the ability to spend and save at the same time.
              </BlurInParagraph>
              <LandingCtaButton>Get your Self-Repaying Loan</LandingCtaButton>
            </div>

            <RiveSection />
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center space-y-4 pb-4 lg:pb-10 2xl:mt-16 2xl:space-y-8 2xl:pb-20">
          <h2 className="text-center text-lg font-semibold 2xl:text-[58px]">
            A Thriving Ecosystem
          </h2>
          <div className="max-w-xs sm:max-w-xl md:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl">
            <EcosystemGrid />
          </div>
        </div>
      </div>
    </div>
  );
};
