import { MoonIcon, SunIcon, FileIcon, DollarSignIcon } from "lucide-react";

import { LeftNav } from "@/components/layout/LeftNav";
import XPrevTwitterIcon from "@/assets/logos/x.svg?react";
import { Button } from "../ui/button";
import { MobileNav } from "./MobileNav";
import { useTheme } from "../providers/ThemeProvider";
import { useSettings } from "../providers/SettingsProvider";

export function LeftBlock() {
  const { darkMode, handleDarkModeToggle } = useTheme();
  const { currency, handleCurrencyChange } = useSettings();
  return (
    <>
      <div className="hidden max-h-screen min-w-[352px] flex-col gap-20 pl-8 pr-9 pt-8 lg:flex">
        <LeftNav />
        <footer className="flex items-center justify-between px-4">
          <Button
            variant="ghost"
            className="h-7 w-7 rounded-sm border border-iconsInverse/40 bg-transparent p-1 text-iconsInverse/40 transition-colors hover:border-iconsInverse hover:bg-transparent hover:text-iconsInverse dark:border-orange4/40 dark:bg-transparent dark:text-orange4/40 dark:hover:border-orange4 dark:hover:bg-transparent dark:hover:text-orange4"
            onClick={handleDarkModeToggle}
            aria-label="Theme toggle (light or dark)"
          >
            {darkMode ? (
              <MoonIcon className="h-4 w-4" />
            ) : (
              <SunIcon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            className="h-7 w-7 rounded-sm border border-iconsInverse/40 bg-transparent fill-iconsInverse/40 p-1 text-iconsInverse/40 transition-colors hover:border-iconsInverse hover:bg-transparent hover:fill-iconsInverse hover:text-iconsInverse dark:border-orange4/40 dark:bg-transparent dark:fill-orange4/40 dark:text-orange4/40 dark:hover:border-orange4 dark:hover:bg-transparent dark:hover:fill-orange4 dark:hover:text-orange4"
            onClick={handleCurrencyChange}
            aria-label="Currency toggle (USD or ETH)"
          >
            {currency === "USD" ? <DollarSignIcon className="h-4 w-4" /> : "Ξ"}
          </Button>
          <a
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-iconsInverse/40 p-1 text-iconsInverse/40 transition-colors hover:border-iconsInverse hover:text-iconsInverse dark:border-orange4/40 dark:text-orange4/40 dark:hover:border-orange4 dark:hover:text-orange4"
            href="https://alchemix-finance.gitbook.io/user-docs"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Documentation"
          >
            <FileIcon className="h-4 w-4" />
          </a>
          <a
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-iconsInverse/40 fill-iconsInverse/40 p-1 transition-colors hover:border-iconsInverse hover:fill-iconsInverse dark:border-orange4/40 dark:fill-orange4/40 dark:hover:border-orange4 dark:hover:fill-orange4"
            href="https://twitter.com/AlchemixFi"
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Twitter"
          >
            <XPrevTwitterIcon className="h-4 w-4" />
          </a>
        </footer>
      </div>
      <MobileNav />
    </>
  );
}
