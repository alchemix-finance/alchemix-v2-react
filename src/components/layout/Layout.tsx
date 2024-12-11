import { useLocation } from "@tanstack/react-router";

import { LeftBlock } from "@/components/layout/LeftBlock";
import { Header } from "@/components/layout/Header";
import { Footer } from "./Footer";
import { cn } from "@/utils/cn";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const isLanding = useLocation().pathname === "/";
  return (
    <div>
      <div className="relative flex min-h-dvh flex-col overflow-x-clip">
        <Header />
        <div className="flex flex-grow">
          <LeftBlock />
          <div className="flex flex-grow flex-col border-l border-grey5inverse dark:border-grey5">
            <main
              className={cn(
                "mx-auto w-full flex-grow",
                !isLanding && "max-w-screen-xl",
              )}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
