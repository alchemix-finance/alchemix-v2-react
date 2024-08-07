import { lazy, Suspense, useEffect, useState } from "react";
import {
  createRootRoute,
  ErrorComponentProps,
  Outlet,
} from "@tanstack/react-router";

import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";

import "@/styles/index.css";
import { cn } from "@/utils/cn";

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <Layout>
          <Outlet />
        </Layout>
        <Toaster position="top-center" />
        <Suspense>
          <TanStackRouterDevtools />
        </Suspense>
      </>
    );
  },
  errorComponent: ErrorComponent,
});

function ErrorComponent(props: ErrorComponentProps) {
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);
  // Reload the page on production deployment updates
  // https://vitejs.dev/guide/build#load-error-handling
  useEffect(() => {
    const listener = () => {
      setIsNewVersionAvailable(true);
    };
    window.addEventListener("vite:preloadError", listener);
    return () => window.removeEventListener("vite:preloadError", listener);
  }, []);
  return (
    <div className={cn("p-2", !isNewVersionAvailable && "text-red-500")}>
      {isNewVersionAvailable
        ? "New dApp version is available. Please, reload the page!"
        : props.error.message}
    </div>
  );
}
