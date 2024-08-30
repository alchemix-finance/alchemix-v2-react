import { LeftNav } from "@/components/layout/LeftNav";
import { Button } from "../ui/button";
import { MoonIcon, SunIcon, FileIcon } from "lucide-react";
import XPrevTwitterIcon from "@/assets/logos/x.svg?react";
import { MobileNav } from "./MobileNav";
import { useTheme } from "../providers/ThemeProvider";

export function LeftBlock() {
  const { darkMode, handleDarkModeToggle } = useTheme();
  return (
    <>
      <div className="hidden max-h-screen min-w-[352px] flex-col gap-20 pl-8 pr-9 pt-8 lg:flex">
        <LeftNav />
        <footer className="flex items-center justify-between px-4">
          <Button
            variant="ghost"
            className="h-7 w-7 rounded border border-iconsInverse/40 bg-transparent p-1 text-iconsInverse/40 transition-colors hover:border-iconsInverse hover:bg-transparent hover:text-iconsInverse dark:border-orange4/40 dark:bg-transparent dark:text-orange4/40 dark:hover:border-orange4 dark:hover:bg-transparent dark:hover:text-orange4"
            onClick={handleDarkModeToggle}
          >
            {darkMode ? (
              <MoonIcon className="h-4 w-4" />
            ) : (
              <SunIcon className="h-4 w-4" />
            )}
          </Button>
          <a
            className="flex h-7 w-7 items-center justify-center rounded border border-iconsInverse/40 p-1 text-iconsInverse/40 transition-colors hover:border-iconsInverse hover:text-iconsInverse dark:border-orange4/40 dark:text-orange4/40 dark:hover:border-orange4 dark:hover:text-orange4"
            href="https://alchemix-finance.gitbook.io/v2/"
            target="_blank"
            rel="noreferrer noopener"
          >
            <FileIcon className="h-4 w-4" />
          </a>
          <a
            className="flex h-7 w-7 items-center justify-center rounded border border-iconsInverse/40 fill-iconsInverse/40 p-1 transition-colors hover:border-iconsInverse hover:fill-iconsInverse dark:border-orange4/40 dark:fill-orange4/40 dark:hover:border-orange4 dark:hover:fill-orange4"
            href="https://twitter.com/AlchemixFi"
            target="_blank"
            rel="noreferrer noopener"
          >
            <XPrevTwitterIcon className="h-4 w-4" />
          </a>
        </footer>
      </div>
      <MobileNav />
    </>
  );
}
