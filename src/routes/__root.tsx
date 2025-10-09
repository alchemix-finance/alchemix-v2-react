import { createRootRoute, Outlet } from "@tanstack/react-router";

import "@/styles/index.css";

import { Layout } from "@/components/layout/Layout";
import { Toaster } from "@/components/ui/sonner";
import { ErrorComponent } from "@/components/error/ErrorComponent";
import { SmartAccountNotice } from "@/components/common/SmartAccountNotice";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <Layout>
          <Outlet />
        </Layout>
        <Toaster position="top-center" />
        <SmartAccountNotice />
      </>
    );
  },
  errorComponent: ErrorComponent,
});
