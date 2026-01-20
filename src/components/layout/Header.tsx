import { Link } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ToOptions } from "@tanstack/react-router";

import { IS_TENDERLY_FORK } from "@/lib/wagmi/tenderly";

export const routeTitleToPathMapping = {
  Vaults: { to: "/vaults", icon: "/images/icons/vaults_med.svg" },
  Transmuters: { to: "/transmuters", icon: "/images/icons/transmuter_med.svg" },
  Bridge: { to: "/bridge", icon: "/images/icons/swap_med.svg" },
  Farms: { to: "/farms", icon: "/images/icons/farm_med.svg" },
  Governance: { to: "/governance", icon: "/images/icons/alcx_med.svg" },
  Utilities: { to: "/utilities", icon: "/images/icons/utilities_med.svg" },
  Mana: { to: "/mana", icon: "/images/icons/points_thick.svg" },
} as const satisfies Record<string, { to: ToOptions["to"]; icon: string }>;

export type RouteTitle = keyof typeof routeTitleToPathMapping;

export function Header() {
  return (
    <header className="border-grey5inverse bg-grey30inverse dark:border-grey5 dark:bg-grey30 flex items-center justify-between border-b p-4 md:pt-5 md:pb-5 md:pl-8">
      <Link to="/" className="flex items-center justify-center">
        <img
          src="/images/icons/ALCX_Std_logo.svg"
          className="h-11 invert dark:filter-none"
          alt="The Alchemix logo"
        />
      </Link>
      <div className="flex items-center gap-4 [&>div>button]:text-center!">
        {IS_TENDERLY_FORK && (
          <Link to="/debug">
            <div className="border-red1 bg-grey5inverse dark:bg-grey5 border p-2">
              <p>FORK</p>
            </div>
          </Link>
        )}
        <ConnectButton
          accountStatus="address"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </header>
  );
}
