import { VideoModal } from "./VideoModal";
import { BlurInHeader, BlurInParagraph } from "./BlurInText";
import { LandingClosingCtaButton, LandingSubButton } from "./LandingCtaButton";
import { SlideBox } from "./SlideBox";
import { Tokens } from "./Tokens";
import { EcosystemGrid } from "./EcosystemGrid";
import { RiveSection } from "./RiveSection";

export const Landing = () => {
  return (
    <div className="relative flex flex-col items-center font-alcxTitles">
      <div className="flex flex-col items-center justify-center gap-4 px-20 py-24">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <BlurInHeader
            className="bg-gradient-to-br from-bronze4 via-bronze3 to-bronze4 bg-clip-text text-7xl font-extrabold leading-tight tracking-normal text-transparent drop-shadow-[8px_8px_16px_rgba(0,_0,_0,_0.8)] dark:bg-gradient-to-r dark:from-bronze1 dark:via-neutral-100 dark:to-bronze1"
            delay={0.1}
          >
            Self-Repaying Loans,
            <br />
            Without Liquidations
          </BlurInHeader>
          <BlurInParagraph
            className="mb-12 mt-8 font-sans text-2xl leading-snug text-lightgrey10inverse dark:text-white"
            delay={0.2}
          >
            Alchemix loans automatically pay themselves off without risk of
            liquidation.
            <br /> Unlock the potential of your assets with secure and
            stress-free borrowing.
          </BlurInParagraph>
          <div className="flex items-center justify-center gap-6">
            <LandingClosingCtaButton delay={0.2}>
              Get your Self-Repaying Loan
            </LandingClosingCtaButton>
            <VideoModal delay={0.2} />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-20 bg-gradient-to-br from-lightgrey5inverse to-lightgrey10inverse pt-20 dark:from-[#0B0D12] dark:to-[#171B24]">
        <div className="flex items-center gap-4 px-40">
          <div className="w-full">
            <img
              src="images/landing-page/01_Flexible.png"
              alt="Three magic vessels"
              className="h-auto w-full"
            />
          </div>
          <SlideBox className="w-full pl-10" direction="bottom">
            <h2 className="text-[42px] font-semibold">Completely Flexible</h2>
            <p className="mb-7 mt-3 font-sans text-2xl leading-snug text-lightgrey10inverse dark:text-lightgrey10">
              Alchemix gives you full control of your finances<br></br> with no
              hidden fees. Repay on your terms, keep<br></br> your assets
              working for you, and borrow against<br></br> your collateral to
              secure future yield.
            </p>

            <LandingSubButton delay={0.2}>Explore our vaults</LandingSubButton>
          </SlideBox>
        </div>

        <div className="flex items-center gap-4 px-40 pb-12">
          <div className="w-full pl-10">
            <h2 className="text-[42px] font-semibold">Zero Liquidations</h2>
            <p className="mb-7 mt-3 font-sans text-2xl leading-snug text-lightgrey10inverse dark:text-lightgrey10">
              With Alchemix, market volatility won&apos;t touch <br></br> your
              vault. Your debt is securely tied to your<br></br> collateral,
              ensuring that price swings never put<br></br> you at risk.
            </p>
            <LandingSubButton delay={0.2}>Learn more</LandingSubButton>
          </div>

          <div className="w-full">
            <img
              src="images/landing-page/02_NoLiquidations.png"
              alt="Zero Liquidations"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full items-center gap-4 rounded-sm bg-[#080a0e] px-40 py-20">
        <div className="w-full pl-10">
          <h2 className="text-[42px] font-semibold">Security First</h2>
          <p className="mb-7 mt-3 font-sans text-2xl leading-snug text-lightgrey10inverse dark:text-lightgrey10">
            We are the original battle-tested DeFi platform with a priority of
            asset protection. As a pioneer in DeFi, we ensure your assets are
            preserved at every step.
          </p>

          <LandingSubButton delay={0.2}>Explore our audits</LandingSubButton>
        </div>

        <div className="w-full">
          <img
            src="/images/landing-page/03_Padlock.png"
            alt="Lock vector image"
            className="h-auto w-full"
            loading="lazy"
          />
        </div>
      </div>

      <div className="dark:bg-[#11141B]">
        <div className="flex px-40 py-20">
          <Tokens />
          <div className="flex w-full flex-col items-start justify-center pl-10 text-center">
            <BlurInHeader className="text-[42px] font-bold">
              Your Favorite Tokens
            </BlurInHeader>
            <BlurInParagraph
              className="mt-3 text-left font-sans text-2xl leading-snug text-lightgrey10inverse dark:text-lightgrey10"
              delay={0.2}
            >
              Borrow up to 50% of your collateral, whist earning yield on your
              full stack.
            </BlurInParagraph>
          </div>
        </div>

        <div className="flex flex-col items-center bg-[#080a0e] pb-20">
          <div className="space-y-10 p-20 text-center">
            <BlurInHeader className="whitespace-nowrap bg-gradient-to-r from-bronze1 via-neutral-100 to-bronze1 bg-clip-text text-[64px] font-extrabold text-transparent dark:from-bronze1 dark:via-neutral-100 dark:to-bronze1">
              Get started with Alchemix
            </BlurInHeader>
            <BlurInParagraph className="whitespace-nowrap text-[28px] font-bold leading-tight text-lightgrey10inverse dark:text-white">
              Alchemix&apos;s self-repaying loans automatically pay themselves
              off using the interest earned
              <br />
              on your initial deposit. Borrow against your assets, earn yield on
              the full deposit amount,
              <br />
              and enjoy the ability to spend and save at the same time.
            </BlurInParagraph>
            <LandingClosingCtaButton>
              Get your Self-Repaying Loan
            </LandingClosingCtaButton>
          </div>

          <RiveSection />
        </div>

        <div className="flex flex-col items-center space-y-8 pb-20 pt-16">
          <h2 className="text-center text-[58px] font-semibold">
            A Thriving Ecosystem
          </h2>
          <div className="max-w-5xl">
            <EcosystemGrid />
          </div>
        </div>
      </div>
    </div>
  );
};
