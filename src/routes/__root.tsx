import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";

import "@/styles/index.css";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <Layout>
          <Outlet />
        </Layout>
        <Toaster position="top-center" />
        <TanStackRouterDevtools />
      </>
    );
  },
  errorComponent: (props) => (
    <div className="p-2 text-red-500">{props.error.message}</div>
  ),
});
