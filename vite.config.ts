import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgrPlugin from "vite-plugin-svgr";
import tailwindcss from '@tailwindcss/vite'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svgrPlugin(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["solid-js", "solid-js/web"],
  },
  build: {
    rollupOptions: {
      external: ["solid-js", "solid-js/web"],
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

  // NOTE: Define global variable for the app environment
  // Only works if we use vercel for deployment.
  define: {
    __VERCEL_ENV__: JSON.stringify(process.env.VITE_VERCEL_ENV),
  },
});
