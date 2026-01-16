import { useLocation } from "@tanstack/react-router";

import { LeftBlock } from "@/components/layout/LeftBlock";
import { Header } from "@/components/layout/Header";
import { Footer } from "./Footer";
import { cn } from "@/utils/cn";
import { MigrationBanner } from "../landing/MigrationBanner";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const isLanding = useLocation().pathname === "/";
  return (
    <div>
      <MigrationBanner />

      <div className="relative flex min-h-dvh flex-col overflow-x-clip">
        <Header />
        <div className="flex grow">
          <LeftBlock />
          <div className="border-grey5inverse dark:border-grey5 flex grow flex-col lg:border-l">
            <main
              className={cn(
                "mx-auto w-full grow",
                !isLanding && "max-w-(--breakpoint-xl)",
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
