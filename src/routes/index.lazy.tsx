import { createLazyFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/common/Page";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

const assets = [
  {
    name: "ETH",
    ltv: "50",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    price: "",
  },
  {
    name: "WSTETH",
    ltv: "50",
    address: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
    price: "",
  },
  {
    name: "RETH",
    ltv: "50",
    address: "0xae78736Cd615f374D3085123A210448E74Fc6393",
    price: "",
  },
  {
    name: "DAI",
    ltv: "50",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    price: "",
  },
  {
    name: "USDC",
    ltv: "50",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    price: "",
  },
  {
    name: "USDT",
    ltv: "50",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    price: "",
  },
];

function Index() {
  return (
    <Page title="Alchemix" description="About us">
      <div className="mt-12 text-center font-alcxTitles text-5xl font-medium leading-tight">
        <span className="bg-gradient-to-br from-bronze4 via-bronze3 to-bronze4 bg-clip-text text-transparent">
          Alchemix Self-Repaying Loans allow you to leverage a range of tokens
          without risk of liquidation.
        </span>
      </div>

      <p className="text-center text-3xl font-thin opacity-50 animate-in fade-in-50">
        Borrow up to 50% of your deposited collateral. Spend and save at the
        same time. Your only debt is time.
      </p>

      <div className="flex justify-center">
        <a
          href="/vaults"
          className="glow h-max w-max rounded-lg border-2 border-orange4 px-4 py-2 font-alcxTitles text-xl tracking-wider transition-all"
        >
          <span className="flex h-max flex-row content-center space-x-4 self-center text-orange4">
            <span className="self-center text-white2inverse">
              Get your first Self-Repaying Loan
            </span>
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
        </a>
      </div>

      <div
        className="group relative flex h-auto w-full cursor-pointer justify-center overflow-hidden text-orange4"
        onClick={() =>
          window.open(
            "https://www.youtube.com/embed/FlWP9FC8C3c?autoplay=1",
            "_blank",
          )
        }
      >
        <img
          src="/images/landing-page/ad.jpg"
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

      <div>
        <p className="mb-4 text-center text-lg opacity-75">
          By borrowing a synthetic version of the asset you deposit you'll avoid
          the risk of liquidation. Defi innovation on a whole new level,
          Alchemix is the first same-asset loan product in DeFi.
        </p>
        <p className="text-center text-lg opacity-75">
          Using your collateral we earn yield on your behalf to pay off your
          loan automagically!
        </p>
      </div>

      <div className="flex w-full flex-col">
        <p className="text-center font-alcxTitles text-3xl opacity-75">
          Choose your path
        </p>
        <p className="text-center text-lg opacity-75">
          A multi-functional account for all your financial needs
        </p>
        <img
          className="w-3/4 self-center"
          src="/images/landing-page/diagram.svg"
          alt="A diagram depicting the possibilities of Alchemix"
        />
        <a
          className="text-center underline"
          href="https://alchemix-finance.gitbook.io/v2/"
        >
          Learn more
        </a>
      </div>

      <div className="flex w-full flex-col space-y-4 border-b border-t border-grey5inverse py-8">
        <p className="text-center font-alcxTitles text-3xl opacity-75">
          Leverage your assets
        </p>
        <div className="flex flex-col justify-center gap-2 lg:flex-row">
          {assets.map((asset) => (
            <div
              key={asset.address}
              className="flex w-full flex-row space-x-4 rounded-lg border border-grey1inverse bg-grey15inverse p-4 lg:w-max"
            >
              <img
                src={`/images/icons/${asset.name.toLowerCase()}.svg`}
                className="w-16"
                alt={asset.name}
              />
              <div>
                <p>{asset.name}</p>
                <p>{asset.price}</p>
                <p>{asset.ltv}% LTV</p>
              </div>
            </div>
          ))}
        </div>
        <a
          className="text-center underline"
          href="https://alchemix-finance.gitbook.io/v2/"
        >
          Learn more
        </a>
      </div>

      <div className="flex w-full flex-col space-y-4">
        <p className="text-center font-alcxTitles text-3xl opacity-75">
          The benefits of Alchemix
        </p>
        <div className="flex w-full flex-col md:flex-row">
          <div className="relative flex flex-1 flex-col space-y-4 border border-grey1inverse bg-grey15inverse p-4 pb-16">
            <p className="font-alcxTitles text-2xl font-light text-orange4">
              Leverage your wealth
            </p>
            <p className="mb text-lg font-light opacity-75">
              Keep exposure to important assets while making them work for you.
              Leverage more of your wealth (without risk of liquidation!) by
              borrowing a synthetic version of your collateral.
            </p>
            <a
              href="https://alchemix-finance.gitbook.io/v2/"
              className="absolute inset-x-0 bottom-4 text-center underline"
            >
              Learn more
            </a>
          </div>
          <div className="relative flex flex-1 flex-col space-y-4 border border-grey1inverse bg-grey15inverse p-4 pb-16">
            <p className="font-alcxTitles text-2xl font-light text-orange4">
              Wide range of tokens
            </p>
            <p className="text-lg font-light opacity-75">
              Alchemix is opening doors to new collateral types. Leverage more
              of your wealth than ever before.
            </p>
            <a
              href="https://alchemix-finance.gitbook.io/v2/"
              className="absolute inset-x-0 bottom-4 text-center underline"
            >
              Learn more
            </a>
          </div>
          <div className="relative flex flex-1 flex-col space-y-4 border border-grey1inverse bg-grey15inverse p-4 pb-16">
            <p className="font-alcxTitles text-2xl font-light text-orange4">
              No liquidations
            </p>
            <p className="text-lg font-light opacity-75">
              No matter what happens we'll never liquidate your deposit. You can
              choose to self-liquidate your own loan at your own discretion.
            </p>
            <a
              href="https://alchemix-finance.gitbook.io/v2/"
              className="absolute inset-x-0 bottom-4 text-center underline"
            >
              Learn more
            </a>
          </div>
          <div className="relative flex flex-1 flex-col space-y-4 border border-grey1inverse bg-grey15inverse p-4 pb-16">
            <p className="font-alcxTitles text-2xl font-light text-orange4">
              Completely flexible
            </p>
            <p className="text-lg font-light opacity-75">
              Alchemix doesn't lock your deposit or charge you fees. Your funds
              are accessible 100% of the time. You can also repay your debt
              whenever you like.
            </p>
            <a
              href="https://alchemix-finance.gitbook.io/v2/"
              className="absolute inset-x-0 bottom-4 text-center underline"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>

      <div className="flex justify-center text-bronze4inverse">
        <a
          href="/vaults"
          className="glow h-max w-max rounded-lg border-2 border-orange4 px-4 py-2 font-alcxTitles text-xl tracking-wider transition-all"
        >
          <span className="flex h-max flex-row content-center space-x-4 self-center text-orange4">
            <span className="self-center text-white2inverse">
              Get your first Self-Repaying Loan
            </span>
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
        </a>
      </div>
    </Page>
  );
}
