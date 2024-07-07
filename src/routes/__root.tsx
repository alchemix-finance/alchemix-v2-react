import { lazy, Suspense } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";

import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";

import "@/styles/index.css";

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
  errorComponent: (props) => (
    <div className="p-2 text-red-500">{props.error.message}</div>
  ),
});
