import { VideoModal } from "./VideoModal";
import { BlurInHeader, BlurInParagraph } from "./BlurInText";
import { LandingClosingCtaButton, LandingSubButton } from "./LandingCtaButton";
import { SlideBox } from "./SlideBox";
import { Tokens } from "./Tokens";
import { EcosystemGrid } from "./EcosystemGrid";

export const Landing = () => {
  return (
    <div className="bg-heroBg relative flex flex-col items-center space-y-0 bg-contain font-alcxTitles">
      <div className="flex flex-col items-center justify-center gap-4 px-20 py-24">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <BlurInHeader
            className="bg-gradient-to-br from-bronze4 via-bronze3 to-bronze4 bg-clip-text text-[72px] font-extrabold leading-tight tracking-normal text-transparent drop-shadow-[8px_8px_16px_rgba(0,_0,_0,_0.8)] dark:bg-gradient-to-r dark:from-bronze1 dark:via-neutral-100 dark:to-bronze1"
            delay={0.1}
          >
            Self-Repaying Loans,
            <br />
            Without Liquidations
          </BlurInHeader>
          <BlurInParagraph
            className="mb-12 mt-8 font-sans text-[24px] leading-snug text-lightgrey10inverse dark:text-white"
            delay={0.2}
          >
            Alchemix loans automatically pay themselves off without risk of
            liquidation.
            <br /> Unlock the potential of your assets with secure and
            stress-free borrowing.
          </BlurInParagraph>
          <div className="flex items-center justify-center gap-4">
            <LandingClosingCtaButton delay={0.2} />
            <VideoModal delay={0.2} className="ml-2" />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-20 bg-gradient-to-br from-lightgrey5inverse to-lightgrey10inverse pt-20 dark:from-[#0B0D12] dark:to-[#171B24]">
        <div className="flex items-center gap-4 px-40">
          <div className="flex-1">
            <img
              src="images/landing-page/01_Flexible.png"
              alt="Three magic vessels"
              className="h-auto w-full"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </div>
          <SlideBox className="flex-1" direction="bottom">
            <h2 className="ml-10 text-[42px] font-semibold">
              Completely Flexible
            </h2>
            <p className="mb-7 ml-10 mt-3 font-sans text-[24px] leading-snug text-lightgrey10inverse dark:text-lightgrey10">
              Alchemix gives you full control of your finances<br></br> with no
              hidden fees. Repay on your terms, keep<br></br> your assets
              working for you, and borrow against<br></br> your collateral to
              secure future yield.
            </p>

            <LandingSubButton delay={0.2} text="Explore our vaults" />
          </SlideBox>
        </div>

        <div className="flex items-center gap-4 px-40 pb-12">
          <div className="flex-1">
            <h2 className="ml-10 text-[42px] font-semibold">
              Zero Liquidations
            </h2>
            <p className="mb-7 ml-10 mt-3 font-sans text-[24px] leading-snug text-lightgrey10inverse dark:text-lightgrey10">
              With Alchemix, market volatility won&apos;t touch <br></br> your
              vault. Your debt is securely tied to your<br></br> collateral,
              ensuring that price swings never put<br></br> you at risk.
            </p>

            <LandingSubButton delay={0.2} text="Learn more" />
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
      <div className="flex w-full items-center gap-4 rounded-sm bg-[#080a0e] px-40 py-20">
        <div className="flex-1">
          <h2 className="ml-10 text-[42px] font-semibold">Security First</h2>
          <p className="mb-7 ml-10 mt-3 font-sans text-[24px] leading-snug text-lightgrey10inverse dark:text-lightgrey10">
            We are the original battle-tested DeFi platform with a priority of
            asset protection. As a pioneer in DeFi, we ensure your assets are
            preserved at every step.
          </p>

          <LandingSubButton delay={0.2} text="Explore our audits" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full rounded">
            <img
              src="/images/landing-page/03_Padlock.png"
              alt="Lock vector image"
              className="h-auto w-full"
              loading="lazy"
            />
          </div>
        </div>
      </div>
      <div className="z-0 flex flex-col bg-lightgrey5inverse text-center dark:bg-[#11141B]">
        <div className="w-full">
          <div className="mx-40 flex py-20">
            <div className="w-1/2">
              <Tokens />
            </div>
            <div className="flex w-1/2 flex-col items-start justify-center pl-10 text-center">
              <BlurInHeader className="text-[42px] font-bold">
                Your Favorite Tokens
              </BlurInHeader>
              <BlurInParagraph
                className="mt-3 text-left font-sans text-[24px] leading-snug text-lightgrey10inverse dark:text-lightgrey10"
                delay={0.2}
              >
                Borrow up to 50% of your collateral, whist earning yield on your
                full stack.
              </BlurInParagraph>
            </div>
          </div>
        </div>

        <div className="bg-heroBg flex flex-col items-center bg-[#080a0e] bg-cover pb-20">
          <div className="flex w-full items-center justify-center">
            <div className="mx-auto flex w-full max-w-screen-lg items-center justify-center gap-4 px-20 pb-20 pt-20">
              <div className="mx-auto flex-1 text-center">
                <BlurInHeader className="mb-10 whitespace-nowrap bg-gradient-to-r from-bronze1 via-neutral-100 to-bronze1 bg-clip-text text-[64px] font-extrabold text-transparent dark:from-bronze1 dark:via-neutral-100 dark:to-bronze1">
                  Get started with Alchemix
                </BlurInHeader>

                <BlurInParagraph className="whitespace-nowrap pb-14 text-[28px] font-bold leading-tight text-lightgrey10inverse dark:text-white">
                  Alchemix&apos;s self-repaying loans automatically pay
                  themselves off using the interest earned<br></br> on your
                  initial deposit. Borrow against your assets, earn yield on the
                  full deposit amount,<br></br> and enjoy the ability to spend
                  and save at the same time.
                </BlurInParagraph>
                <LandingClosingCtaButton />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch justify-center gap-6 lg:flex-row">
            <div className="relative drop-shadow-md">
              {/* Tried to implement RiveComponenet, but the files provided were
                throwing errors. I think its on the file side, seems to be recursive errors or negatively interacting with useEffect? */}
              {/* <RiveComponent
                  src="/riv/1_deposit.riv"
                  onLoad={() =>
                    console.log("Rive animation loaded successfully")
                  }
                  onError={(e) =>
                    console.error("Error loading Rive animation:", e)
                  }
                /> */}
              <img
                src="/images/landing-page/1.png"
                alt="Deposit"
                className="h-full w-full rounded-3xl object-contain transition-opacity duration-300 ease-in-out"
              />
              <img
                src="/images/landing-page/1-hover.png"
                alt="Deposit Hover"
                className="absolute inset-0 h-full w-full rounded-3xl object-contain opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
              />
            </div>
            <div className="relative drop-shadow-md">
              <img
                src="/images/landing-page/2.png"
                alt="Earn"
                className="h-full w-full rounded-3xl object-contain transition-opacity duration-300 ease-in-out"
              />
              <img
                src="/images/landing-page/2-hover.png"
                alt="Earn Hover"
                className="absolute inset-0 h-full w-full rounded-3xl object-contain opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
              />
            </div>
            <div className="relative drop-shadow-md">
              <img
                src="/images/landing-page/3.png"
                alt="Access"
                className="h-full w-full rounded-3xl object-contain transition-opacity duration-300 ease-in-out hover:opacity-0"
              />
              <img
                src="/images/landing-page/3-hover.png"
                alt="Access Hover"
                className="absolute inset-0 h-full w-full rounded-3xl object-contain opacity-0 transition-opacity duration-300 ease-in-out hover:opacity-100"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start space-y-8 pt-16 text-start">
          <h2 className="self-center text-center text-[58px] font-semibold">
            A Thriving Ecosystem
          </h2>
          <div className="px-64 pb-20">
            <EcosystemGrid />
          </div>
        </div>
      </div>
    </div>
  );
};
