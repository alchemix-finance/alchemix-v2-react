import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

import { Web3Provider } from "@/components/providers/Web3Provider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { FramerMotionProvider } from "@/components/providers/FramerMotionProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";

// Import the generated route tree
import { routeTree } from "@/routeTree.gen";

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <SettingsProvider>
          <QueryProvider>
            <Web3Provider>
              <FramerMotionProvider>
                <RouterProvider router={router} />
              </FramerMotionProvider>
            </Web3Provider>
          </QueryProvider>
        </SettingsProvider>
      </ThemeProvider>
    </React.StrictMode>,
  );
}
