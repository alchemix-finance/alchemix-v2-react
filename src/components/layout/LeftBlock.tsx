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
            className="h-7 w-7 rounded border border-grey5inverse bg-transparent p-1 text-grey5inverse hover:border-grey1inverse hover:bg-transparent hover:text-grey1inverse"
            onClick={handleDarkModeToggle}
          >
            {darkMode ? (
              <MoonIcon className="h-4 w-4" />
            ) : (
              <SunIcon className="h-4 w-4" />
            )}
          </Button>
          <a
            className="flex h-7 w-7 items-center justify-center rounded border border-grey5inverse p-1 text-grey5inverse transition-colors hover:border-grey1inverse hover:text-grey1inverse"
            href="https://alchemix-finance.gitbook.io/v2/"
            target="_blank"
            rel="noreferrer noopener"
          >
            <FileIcon className="h-4 w-4" />
          </a>
          <a
            className="flex h-7 w-7 items-center justify-center rounded border border-grey5inverse fill-grey5inverse p-1 transition-colors hover:border-grey1inverse hover:text-grey1inverse"
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
