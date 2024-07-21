import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react(), svgrPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // NOTE: vesper pools endpoint and yearn doesn't have CORS set up ?
  server: {
    proxy: {
      "/vesper-pools": {
        target: "https://api.vesper.finance/pools",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vesper-pools/, ""),
      },
      "/yearn-vaults": {
        target: "https://ydaemon.yearn.fi/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yearn-vaults/, ""),
      },
    },
  },
});
