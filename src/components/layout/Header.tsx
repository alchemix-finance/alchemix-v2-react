import { useEffect, useState } from "react";
import { Link, useMatchRoute, useLocation } from "@tanstack/react-router";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import { cn } from "@/utils/cn";

export const routeTitleToPathMapping = {
  Vaults: "/vaults",
  Transmuter: "/transmuters",
  Governance: "/governance",
  Utilities: "/utilities",
} as const;

export function Header() {
  const { pathname } = useLocation();
  const matchRoute = useMatchRoute();

  const [openMobileNav, setOpenMobileNav] = useState(false);

  useEffect(() => {
    setOpenMobileNav(false);
  }, [pathname]);

  return (
    <header className="flex items-center justify-between bg-backgroundLight p-4 md:px-12">
      <div className="flex items-center justify-between gap-10">
        <div className="text-center">
          <Link
            to="/"
            className="flex justify-center p-1 font-alcxLogo text-3xl"
          >
            Alchemix
          </Link>
        </div>
        <input
          id="hamburger"
          type="checkbox"
          checked={openMobileNav}
          onChange={() => setOpenMobileNav((prev) => !prev)}
          className="peer hidden"
        />
        <label
          htmlFor="hamburger"
          className="cursor-pointer text-black md:hidden"
        >
          <HamburgerMenuIcon />
        </label>
        <div className="absolute -left-20 top-0 flex flex-col items-center justify-between gap-10 bg-slate-300 p-8 opacity-0 transition-all peer-checked:translate-x-20 peer-checked:opacity-100 md:hidden">
          {Object.keys(routeTitleToPathMapping).map((item) => (
            <Link
              key={item}
              to={
                routeTitleToPathMapping[
                  item as keyof typeof routeTitleToPathMapping
                ]
              }
              className={cn(
                "text-xl transition-colors hover:text-black",
                matchRoute({
                  to: routeTitleToPathMapping[
                    item as keyof typeof routeTitleToPathMapping
                  ],
                  fuzzy: true,
                })
                  ? "text-black"
                  : "text-slate-500",
              )}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
      <ConnectButton
        accountStatus="address"
        chainStatus="name"
        showBalance={{ smallScreen: false, largeScreen: true }}
      />
    </header>
  );
}
