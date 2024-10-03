import { LeftBlock } from "@/components/layout/LeftBlock";
import { Header } from "@/components/layout/Header";
import { Footer } from "./Footer";

export const Layout = ({
  children,
  isLandingPage,
}: {
  children: React.ReactNode;
  isLandingPage?: boolean;
}) => {
  return (
    <div>
      <div className="flex min-h-dvh flex-col overflow-x-clip">
        <Header />
        <div className="flex flex-grow">
          <LeftBlock />
          <div className="flex flex-grow flex-col border-l border-grey5inverse dark:border-grey5">
            <main
              className={`mx-auto w-full flex-grow ${isLandingPage ? "" : "max-w-screen-xl"}`}
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
