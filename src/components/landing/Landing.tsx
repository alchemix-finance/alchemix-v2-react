import { VideoModal } from "./VideoModal";
import { BlurInHeader, BlurInParagraph } from "./BlurInText";
import { LandingCtaButton, LandingSubButton } from "./LandingCtaButton";
import { SlideBox } from "./SlideBox";
import { Tokens } from "./Tokens";
import { EcosystemGrid } from "./EcosystemGrid";
import { RiveSection } from "./RiveSection";

export const Landing = () => {
  return (
    <div className="font-alcxTitles relative flex flex-col items-center">
      <div className="after:bg-green2 relative flex max-w-(--breakpoint-2xl) flex-col items-center justify-center gap-4 p-5 text-center after:absolute after:top-3/4 after:left-1/2 after:-z-10 after:hidden after:size-1/3 after:-translate-x-1/2 after:blur-[256px] lg:px-10 lg:py-12 dark:after:block">
        <BlurInHeader
          className="from-bronze1 via-bronze3 to-bronze1 dark:from-bronze1 dark:to-bronze1 bg-linear-to-br bg-clip-text text-4xl font-extrabold tracking-normal text-transparent sm:text-5xl xl:text-7xl dark:bg-linear-to-r dark:via-[#f5e5da] dark:drop-shadow-[8px_8px_16px_rgba(0,_0,_0,_0.8)]"
          delay={0.1}
        >
          Self-Repaying Loans,
          <br />
          Without Liquidations
        </BlurInHeader>
        <BlurInParagraph
          className="text-lightgrey10inverse mt-2 mb-4 font-sans leading-snug font-light xl:text-xl dark:text-white"
          delay={0.2}
        >
          Alchemix loans automatically pay themselves off with the yield
          generated from your deposit.
          <br />
          Unlock the potential of your assets with secure and stress-free
          borrowing.
        </BlurInParagraph>
        <div className="flex flex-col items-center justify-center gap-4 xl:flex-row">
          <LandingCtaButton delay={0.2}>
            Get a Self-Repaying Loan
          </LandingCtaButton>
          <VideoModal delay={0.2} />
        </div>
        <div className="absolute top-3/4 left-1/2 -z-10 hidden size-full -translate-x-1/2 bg-[url('/images/landing-page/stars.svg')] bg-contain dark:block" />
      </div>
      <div className="via-bronze1 h-[1px] w-full bg-linear-to-r from-transparent to-transparent"></div>

      <div className="w-full dark:bg-linear-to-br dark:from-[#0B0D12] dark:to-[#171B24]">
        <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-4 py-12">
          <div className="flex flex-col items-center gap-4 px-5 sm:flex-row lg:px-10">
            <SlideBox className="w-full" direction="left" delay={0.2}>
              <img
                src="images/landing-page/flexible.png"
                alt="Three magic vessels"
                className="h-auto w-full"
              />
            </SlideBox>
            <SlideBox
              className="w-full max-w-xl space-y-6"
              direction="bottom"
              delay={0.2}
            >
              <h2 className="text-xl font-semibold">Completely Flexible</h2>
              <p className="text-lightgrey10inverse dark:text-lightgrey10 mt-3 mb-7 font-sans leading-snug font-light xl:text-xl">
                Alchemix gives you full control of your finances with no hidden
                fees. Repay on your terms, keep your assets working for you, and
                borrow against your collateral to secure future&nbsp;yield.
              </p>
              <LandingSubButton delay={0.2}>
                Explore our vaults
              </LandingSubButton>
            </SlideBox>
          </div>

          <div className="flex flex-col-reverse items-center gap-4 px-5 sm:flex-row lg:px-10">
            <div className="w-full max-w-xl space-y-6">
              <h2 className="text-xl font-semibold">Zero Liquidations</h2>
              <p className="text-lightgrey10inverse dark:text-lightgrey10 mt-3 mb-7 font-sans leading-snug font-light xl:text-xl">
                With Alchemix, market volatility won&apos;t touch your vault.
                Your debt is securely tied to your collateral, ensuring that
                price swings never put you at risk.
              </p>
              <LandingSubButton
                delay={0.2}
                href="https://docs.alchemix.fi/#the-benefits-of-alchemix"
              >
                Alchemix Benefits
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
        <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col-reverse items-center gap-4 rounded-xs p-5 sm:flex-row lg:px-10">
          <div className="w-full max-w-xl space-y-6">
            <h2 className="text-xl font-semibold">Security First</h2>
            <p className="text-lightgrey10inverse dark:text-lightgrey10 mt-3 mb-7 font-sans leading-snug font-light xl:text-xl">
              We are the original battle-tested DeFi platform with a priority of
              asset protection. As a pioneer in DeFi, we ensure your assets are
              preserved at every step.
            </p>
            <LandingSubButton
              delay={0.2}
              href="https://docs.alchemix.fi/resources/audits-and-reports"
            >
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
        <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col-reverse items-center gap-6 p-5 sm:flex-row lg:px-10">
          <Tokens />
          <div className="flex w-full max-w-xl flex-col items-center justify-center text-center sm:items-start sm:text-left">
            <BlurInHeader className="text-xl font-semibold">
              Your Favorite Tokens
            </BlurInHeader>
            <BlurInParagraph
              className="text-lightgrey10inverse dark:text-lightgrey10 mt-3 text-left font-sans leading-snug xl:text-xl"
              delay={0.2}
            >
              Borrow up to 50% of your collateral, whist earning yield on your
              full stack.
            </BlurInParagraph>
          </div>
        </div>

        <div className="dark:bg-[#080a0e]">
          <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col items-center pb-5 dark:bg-[#080a0e]">
            <div className="space-y-4 p-5 text-center">
              <BlurInHeader className="from-bronze1 via-bronze3 to-bronze1 dark:from-bronze1 dark:to-bronze1 bg-linear-to-r bg-clip-text text-2xl font-extrabold whitespace-nowrap text-transparent lg:text-4xl dark:via-neutral-100">
                Get started with Alchemix
              </BlurInHeader>
              <BlurInParagraph className="text-lightgrey10inverse dark:text-lightgrey10 font-sans leading-snug xl:text-xl">
                Alchemix&apos;s self-repaying loans automatically pay themselves
                off using the interest earned on your initial deposit. Borrow
                against your assets, earn yield on the full deposit amount, and
                enjoy the ability to spend and save at the same time.
              </BlurInParagraph>
              <LandingCtaButton>Get your Self-Repaying Loan</LandingCtaButton>
            </div>

            <RiveSection />
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center space-y-4 pb-4 lg:pb-10">
          <h2 className="text-center text-lg font-semibold">
            A Thriving Ecosystem
          </h2>
          <div className="max-w-xs sm:max-w-xl md:max-w-2xl xl:max-w-4xl">
            <EcosystemGrid />
          </div>
        </div>
      </div>
    </div>
  );
};
