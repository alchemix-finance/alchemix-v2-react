import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Canvas } from "@react-three/fiber";
import { FileIcon } from "lucide-react";

import XPrevTwitterIcon from "@/assets/logos/x.svg?react";
import DiscordIcon from "@/assets/logos/discord.svg?react";
import { Button } from "@/components/ui/button";

import { VideoModal } from "./VideoModal";
import { ActionsList } from "./ActionsList";
import { Particles } from "./Particles";
import { BlurInHeader } from "./BlurInHeader";

const assets = [
  {
    name: "ETH",
  },
  {
    name: "WSTETH",
  },
  {
    name: "RETH",
  },
  {
    name: "DAI",
  },
  {
    name: "USDC",
  },
  {
    name: "USDT",
  },
];

export const Landing = () => {
  const [height, setHeight] = useState<number>();
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (ref.current && !height) {
      setHeight(ref.current.scrollHeight);
    }
  }, [height]);
  return (
    <div className="relative flex flex-col space-y-14 pb-12 font-alcxTitles">
      <div
        ref={ref}
        className="pointer-events-none absolute inset-0 left-0 top-0 -z-10 size-full"
      >
        {!!height && (
          <Canvas
            camera={{ position: [0, 0, 6], fov: 50, far: 100, near: 0.1 }}
            fallback={null}
          >
            <Particles height={height} />
          </Canvas>
        )}
      </div>
      <div className="flex items-center justify-between gap-16 px-20 py-10">
        <div className="space-y-6">
          <BlurInHeader className="text-4xl font-extrabold">
            Self-Repaying Loans, Without The Liquidations
          </BlurInHeader>
          <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
            Alchemix loans automatically pay themselves off without risk of
            liquidation. Unlock the potential of your assets with secure and
            stress-free borrowing.
          </p>
          <LandingCtaButton />
        </div>
        <VideoModal />
      </div>

      <div className="flex flex-col gap-14 px-20">
        <BlurInHeader className="text-3xl font-semibold">
          Why Alchemix?
        </BlurInHeader>
        <div className="flex items-center gap-24">
          <ActionsList />
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Completely Flexible</h2>
            <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
              Alchemix gives you full control of your finances with no hidden
              fees. Repay on your terms, keep your assets working for you, and
              borrow against your collateral to secure future yield.
            </p>
            <Button size="sm" className="uppercase">
              Exlore our vaults
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-24">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Zero Liquidations</h2>
            <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
              With Alchemix, market volatility won&apos;t touch your vault. Your
              debt is securely tied to your collateral, ensuring that price
              swings never put you at risk.
            </p>
            <Button size="sm" className="uppercase">
              Learn more
            </Button>
          </div>
          <div className="flex w-full items-center justify-center p-6">
            <img
              src="/alchemix-v2-react/images/landing-page/liquidations.png"
              alt="Liquidations section image"
              className="h-64 w-64"
            />
          </div>
        </div>
        <div className="flex items-center gap-24">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Security First</h2>
            <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
              We are the original battle-tested DeFi platform with a priority of
              asset protection. As a pioneer in DeFi, we ensure your assets are
              preserved at every step.
            </p>
            <Button size="sm" className="uppercase">
              Explore our audits
            </Button>
          </div>
          <div className="flex w-full items-center justify-center p-6">
            <img
              src="/alchemix-v2-react/images/landing-page/lock.svg"
              alt="Lock vector image"
              className="h-64 w-64"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-14 px-20 text-center">
        <div>
          <BlurInHeader className="text-3xl font-bold">
            Your Favorite Tokens
          </BlurInHeader>
          <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
            Borrow up to 50% of your collateral
          </p>
        </div>
        <div className="flex items-center justify-between">
          {assets.map((asset) => (
            <img
              key={asset.name}
              alt={asset.name}
              src={`/alchemix-v2-react/images/icons/${asset.name.toLowerCase()}.svg`}
              className="w-20 rounded-full border border-lightgrey10inverse dark:border-lightgrey10"
            />
          ))}
        </div>
        <div className="relative text-start">
          <div className="my-[10%] flex max-w-xl flex-col gap-6">
            <BlurInHeader className="text-3xl font-semibold">
              Get Started With Alchemix
            </BlurInHeader>
            <p className="text-xl font-semibold text-lightgrey10inverse dark:text-lightgrey10">
              Alchemix&apos;s self-repaying loans automatically pay themselves
              off using the interest earned on your initial deposit. Borrow
              against your assets, earn yield on the full deposit amount, and
              enjoy the ability to spend and save at the same time.
            </p>
            <LandingCtaButton />
          </div>
          <div className="pointer-events-none absolute left-64 top-0 -z-10 h-[120%] w-full bg-[url('/images/landing-page/big_placeholder.png')] bg-no-repeat"></div>
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
              src="/alchemix-v2-react/images/landing-page/placeholder.png"
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
              src="/alchemix-v2-react/images/landing-page/placeholder.png"
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
              src="/alchemix-v2-react/images/landing-page/placeholder.png"
            />
          </div>
        </div>
        <div className="space-y-8 text-start">
          <BlurInHeader className="text-center text-4xl font-semibold">
            A Thriving Ecosystem
          </BlurInHeader>
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
  );
};

const LandingCtaButton = () => {
  return (
    <Link
      to="/vaults"
      className="block w-max rounded-lg border-2 border-orange4 bg-bronze1 px-4 py-2 text-xl font-bold tracking-wider text-black2 shadow-glow transition-all hover:shadow-hoveredGlow"
    >
      Get your first Self-Repaying Loan
    </Link>
  );
};
