import { Link } from "@tanstack/react-router";
import { FileIcon } from "lucide-react";

import { windowOpen } from "@/utils/windowOpen";
import XPrevTwitterIcon from "@/assets/logos/x.svg?react";
import DiscordIcon from "@/assets/logos/discord.svg?react";

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
  return (
    <div className="flex flex-col space-y-14 pb-12 font-alcxTitles">
      <div className="flex gap-16 px-24 py-14">
        <div className="space-y-6">
          <h1 className="text-6xl font-extrabold">
            Self-Repaying Loans, Without The Liquidations
          </h1>
          <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
            Alchemix loans automatically pay themselves off without risk of
            liquidation. Unlock the potential of your assets with secure and
            stress-free borrowing.
          </p>
          <LandingCtaButton />
        </div>
        <div className="flex items-center justify-center">
          <div
            className="group relative flex h-1/2 cursor-pointer justify-center overflow-hidden text-orange4"
            onClick={() =>
              windowOpen("https://www.youtube.com/embed/FlWP9FC8C3c?autoplay=1")
            }
          >
            <img
              src="/images/landing-page/ad.webp"
              alt="Watch the Alchemix cinematic ad"
              className="w-full transition-all"
            />
            <svg
              role="img"
              className="absolute h-32 w-32 self-center opacity-50 transition-all group-hover:opacity-100"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-14 px-24">
        <h2 className="text-5xl font-semibold">Why Alchemix?</h2>
        <div className="flex items-center gap-24">
          <div>
            <img />
          </div>
          <div>
            <h2 className="text-5xl font-semibold">Completely Flexible</h2>
            <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
              Alchemix gives you full control of your finances with no hidden
              fees. Repay on your terms, keep your assets working for you, and
              borrow against your collateral to secure future yield.
            </p>
            <button className="uppercase">Exlore our vaults</button>
          </div>
        </div>
        <div className="flex items-center gap-24">
          <div>
            <h2 className="text-5xl font-semibold">Zero Liquidations</h2>
            <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
              With Alchemix, market volatility won&apos;t touch your vault. Your
              debt is securely tied to your collateral, ensuring that price
              swings never put you at risk.
            </p>
            <button className="uppercase">Learn more</button>
          </div>
          <div>
            <img />
          </div>
        </div>
        <div className="flex items-center gap-24">
          <div>
            <h2 className="text-5xl font-semibold">Security First</h2>
            <p className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
              We are the original battle-tested DeFi platform with a priority of
              asset protection. As a pioneer in DeFi, we ensure your assets are
              preserved at every step.
            </p>
            <button className="uppercase">Explore our audits</button>
          </div>
          <div>
            <img />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-14 px-24 text-center">
        <div>
          <h2 className="text-5xl font-bold">Your Favorite Tokens</h2>
          <p className="text-3xl text-lightgrey10inverse dark:text-lightgrey10">
            Borrow up to 50% of your collateral
          </p>
        </div>
        <div className="flex items-center justify-between">
          {assets.map((asset) => (
            <img
              key={asset.name}
              alt={asset.name}
              src={`/images/icons/${asset.name.toLowerCase()}.svg`}
              className="w-20 rounded-full border border-lightgrey10inverse dark:border-lightgrey10"
            />
          ))}
        </div>
        <div className="relative text-start">
          <div className="flex max-w-xl flex-col gap-6">
            <h2 className="text-7xl font-semibold">
              Get Started With Alchemix
            </h2>
            <p className="text-3xl font-semibold text-lightgrey10inverse dark:text-lightgrey10">
              Alchemix&apos;s self-repaying loans automatically pay themselves
              off using the interest earned on your initial deposit. Borrow
              against your assets, earn yield on the full deposit amount, and
              enjoy the ability to spend and save at the same time.
            </p>
            <LandingCtaButton />
          </div>
          <div className="absolute right-0 top-0">IMAGE</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-12">
            <h5 className="inline-flex items-center gap-6">
              <span className="text-4xl font-semibold">01</span>
              <span className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                Deposit your assets
              </span>
            </h5>
            <img />
          </div>
          <div className="flex flex-col gap-12">
            <h5 className="inline-flex items-center gap-6">
              <span className="text-4xl font-semibold">02</span>
              <span className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                Automatically earn yield
              </span>
            </h5>
            <img />
          </div>
          <div className="flex flex-col gap-12">
            <h5 className="inline-flex items-center gap-6">
              <span className="text-4xl font-semibold">03</span>
              <span className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
                Access your future yield
              </span>
            </h5>
            <img />
          </div>
        </div>
        <div className="space-y-8 text-start">
          <h2 className="text-center text-5xl font-semibold">
            A Thriving Ecosystem
          </h2>
          <div className="flex items-stretch justify-between gap-7">
            <div className="flex w-full flex-col justify-between gap-12 rounded-2xl border border-lightgrey10inverse p-9 dark:border-lightgrey10">
              <div className="flex items-center justify-center">
                <DiscordIcon className="h-32 w-32" />
              </div>
              <h5 className="text-4xl font-semibold">Discord</h5>
              <p className="text-lg text-lightgrey10inverse dark:text-lightgrey10">
                Participate in active Alchemix community discussions and get
                user support.
              </p>
              <a href="#" className="uppercase">
                Join Discord
              </a>
            </div>
            <div className="flex w-full flex-col justify-between gap-12 rounded-2xl border border-lightgrey10inverse p-9 dark:border-lightgrey10">
              <div className="flex items-center justify-center">
                <XPrevTwitterIcon className="h-32 w-32" />
              </div>
              <h5 className="text-4xl font-semibold">Twitter</h5>
              <p className="text-lg text-lightgrey10inverse dark:text-lightgrey10">
                Stay up to date with the latest Alchemix news and community
                updates.
              </p>
              <a href="#" className="uppercase">
                Follow Twitter
              </a>
            </div>
            <div className="flex w-full flex-col justify-between gap-12 rounded-2xl border border-lightgrey10inverse p-9 dark:border-lightgrey10">
              <div className="flex items-center justify-center">
                <FileIcon className="h-32 w-32" />
              </div>
              <h5 className="text-4xl font-semibold">Documentation</h5>
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
      className="block w-max rounded-lg border-2 border-orange4 px-4 py-2 text-xl tracking-wider shadow-glow transition-all hover:shadow-hoveredGlow"
    >
      <span className="flex items-center space-x-4 self-center text-orange4">
        <span className="self-center">Get your first Self-Repaying Loan</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 self-center"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          ></path>
        </svg>
      </span>
    </Link>
  );
};
