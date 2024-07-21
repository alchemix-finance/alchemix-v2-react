import { LeftBlock } from "@/components/layout/LeftBlock";
import { Header } from "@/components/layout/Header";
import { Footer } from "./Footer";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <Header />
        <div className="flex flex-grow">
          <LeftBlock />
          <div className="flex flex-grow flex-col border-l border-grey5inverse">
            <main className="flex-grow overflow-y-scroll">{children}</main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
