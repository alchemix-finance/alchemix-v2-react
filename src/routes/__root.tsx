import { lazy, Suspense } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";

import "@/styles/index.css";

import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";
import { ErrorComponent } from "@/components/error/ErrorComponent";
import { useLocation } from "@tanstack/react-router";

const TanStackRouterDevtools = import.meta.env.PROD
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
    const location = useLocation();

    const isLandingPage = location.pathname === "/";
    return (
      <>
        <Layout isLandingPage={isLandingPage}>
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
