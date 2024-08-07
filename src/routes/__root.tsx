import { lazy, Suspense } from "react";
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
  const isNewVersionError = props.error.message.includes(
    "Failed to fetch dynamically imported module",
  );
  return (
    <div className={cn("p-2", !isNewVersionError && "text-red-500")}>
      {isNewVersionError
        ? "New dApp version is available. Please, reload the page."
        : props.error.message}
    </div>
  );
}
