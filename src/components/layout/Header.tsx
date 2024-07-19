import { Link } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ToOptions } from "@tanstack/react-router";
import { IS_TENDERLY_FORK } from "@/lib/wagmi/tenderly";

export const routeTitleToPathMapping = {
  Vaults: "/vaults",
  Transmuter: "/transmuters",
  Bridge: "/bridge",
  Farms: "/farms",
  Governance: "/governance",
  Utilities: "/utilities",
} as const satisfies Record<string, ToOptions["to"]>;

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-grey5inverse bg-grey30inverse p-4 md:pb-5 md:pl-8 md:pt-5">
      <div className="text-center">
        <Link to="/" className="flex items-center justify-center">
          <img
            src="/images/icons/ALCX_Std_logo.svg"
            className="h-11 invert"
            alt="The Alchemix logo"
          />
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {IS_TENDERLY_FORK && (
          <Link to="/debug">
            <div className="border border-red1 bg-grey5inverse p-2">FORK </div>
          </Link>
        )}
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={{ smallScreen: false, largeScreen: true }}
        />
      </div>
    </header>
  );
}
