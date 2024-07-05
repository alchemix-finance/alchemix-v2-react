import { TwitterLogoIcon, FileTextIcon } from "@radix-ui/react-icons";

import { LeftNav } from "@/components/layout/LeftNav";

export function LeftBlock() {
  return (
    <div className="hidden flex-col md:flex md:min-w-[256px] md:max-w-[256px] lg:w-80 lg:min-w-[20rem] lg:max-w-xs">
      <LeftNav />
      <footer className="flex items-center justify-between px-4 py-5 md:px-20">
        <a
          className="block rounded border border-white p-1 text-white transition-colors duration-300 hover:border-lime-100 hover:text-lime-100"
          href="https://alchemix-finance.gitbook.io/v2/"
          target="_blank"
          rel="noreferrer noopener"
        >
          <FileTextIcon />
        </a>
        <a
          className="block rounded border border-white p-1 text-white transition-colors duration-300 hover:border-lime-100 hover:text-lime-100"
          href="https://twitter.com/AlchemixFi"
          target="_blank"
          rel="noreferrer noopener"
        >
          <TwitterLogoIcon />
        </a>
      </footer>
    </div>
  );
}
