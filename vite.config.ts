import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // NOTE: vesper pools endpoint and yearn doesn't have CORS set up ?
  server: {
    proxy: {
      "/proxy/vesper-pools": {
        target: "https://api.vesper.finance/pools",
        changeOrigin: true,
        rewrite: (path) => path.replace("/proxy/vesper-pools", ""),
      },
      "/proxy/yearn-vaults": {
        target: "https://ydaemon.yearn.fi/",
        changeOrigin: true,
        rewrite: (path) => path.replace("/proxy/yearn-vaults", ""),
      },
    },
  },
});
