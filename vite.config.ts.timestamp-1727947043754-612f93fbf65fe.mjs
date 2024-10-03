// vite.config.ts
import { defineConfig } from "file:///F:/Alchemix%20Landing/alchemix-v2-react/node_modules/vite/dist/node/index.js";
import react from "file:///F:/Alchemix%20Landing/alchemix-v2-react/node_modules/@vitejs/plugin-react/dist/index.mjs";
import svgrPlugin from "file:///F:/Alchemix%20Landing/alchemix-v2-react/node_modules/vite-plugin-svgr/dist/index.js";
import { TanStackRouterVite } from "file:///F:/Alchemix%20Landing/alchemix-v2-react/node_modules/@tanstack/router-plugin/dist/esm/vite.js";
import path from "path";
var __vite_injected_original_dirname = "F:\\Alchemix Landing\\alchemix-v2-react";
var vite_config_default = defineConfig({
  plugins: [TanStackRouterVite(), react(), svgrPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  base: "/alchemix-v2-react/",
  // NOTE: vesper pools endpoint and yearn doesn't have CORS set up ?
  server: {
    proxy: {
      "/vesper-pools": {
        target: "https://api.vesper.finance/pools",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/vesper-pools/, "")
      },
      "/yearn-vaults": {
        target: "https://ydaemon.yearn.fi/",
        changeOrigin: true,
        rewrite: (path2) => path2.replace(/^\/yearn-vaults/, "")
      }
    }
  },
  // NOTE: Define global variable for the app environment
  // Only works if we use vercel for deployment.
  define: {
    __VERCEL_ENV__: JSON.stringify(process.env.VITE_VERCEL_ENV)
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJGOlxcXFxBbGNoZW1peCBMYW5kaW5nXFxcXGFsY2hlbWl4LXYyLXJlYWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxBbGNoZW1peCBMYW5kaW5nXFxcXGFsY2hlbWl4LXYyLXJlYWN0XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9BbGNoZW1peCUyMExhbmRpbmcvYWxjaGVtaXgtdjItcmVhY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XHJcbmltcG9ydCBzdmdyUGx1Z2luIGZyb20gXCJ2aXRlLXBsdWdpbi1zdmdyXCI7XHJcbmltcG9ydCB7IFRhblN0YWNrUm91dGVyVml0ZSB9IGZyb20gXCJAdGFuc3RhY2svcm91dGVyLXBsdWdpbi92aXRlXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtUYW5TdGFja1JvdXRlclZpdGUoKSwgcmVhY3QoKSwgc3ZnclBsdWdpbigpXSxcclxuICByZXNvbHZlOiB7XHJcbiAgICBhbGlhczoge1xyXG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgYmFzZTogXCIvYWxjaGVtaXgtdjItcmVhY3QvXCIsXHJcbiAgLy8gTk9URTogdmVzcGVyIHBvb2xzIGVuZHBvaW50IGFuZCB5ZWFybiBkb2Vzbid0IGhhdmUgQ09SUyBzZXQgdXAgP1xyXG4gIHNlcnZlcjoge1xyXG4gICAgcHJveHk6IHtcclxuICAgICAgXCIvdmVzcGVyLXBvb2xzXCI6IHtcclxuICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9hcGkudmVzcGVyLmZpbmFuY2UvcG9vbHNcIixcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL3Zlc3Blci1wb29scy8sIFwiXCIpLFxyXG4gICAgICB9LFxyXG4gICAgICBcIi95ZWFybi12YXVsdHNcIjoge1xyXG4gICAgICAgIHRhcmdldDogXCJodHRwczovL3lkYWVtb24ueWVhcm4uZmkvXCIsXHJcbiAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC95ZWFybi12YXVsdHMvLCBcIlwiKSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuXHJcbiAgLy8gTk9URTogRGVmaW5lIGdsb2JhbCB2YXJpYWJsZSBmb3IgdGhlIGFwcCBlbnZpcm9ubWVudFxyXG4gIC8vIE9ubHkgd29ya3MgaWYgd2UgdXNlIHZlcmNlbCBmb3IgZGVwbG95bWVudC5cclxuICBkZWZpbmU6IHtcclxuICAgIF9fVkVSQ0VMX0VOVl9fOiBKU09OLnN0cmluZ2lmeShwcm9jZXNzLmVudi5WSVRFX1ZFUkNFTF9FTlYpLFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlTLFNBQVMsb0JBQW9CO0FBQ3RVLE9BQU8sV0FBVztBQUNsQixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLDBCQUEwQjtBQUNuQyxPQUFPLFVBQVU7QUFKakIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLG1CQUFtQixHQUFHLE1BQU0sR0FBRyxXQUFXLENBQUM7QUFBQSxFQUNyRCxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUEsRUFFQSxNQUFNO0FBQUE7QUFBQSxFQUVOLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLGlCQUFpQjtBQUFBLFFBQ2YsUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsbUJBQW1CLEVBQUU7QUFBQSxNQUN2RDtBQUFBLE1BQ0EsaUJBQWlCO0FBQUEsUUFDZixRQUFRO0FBQUEsUUFDUixjQUFjO0FBQUEsUUFDZCxTQUFTLENBQUNBLFVBQVNBLE1BQUssUUFBUSxtQkFBbUIsRUFBRTtBQUFBLE1BQ3ZEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBO0FBQUEsRUFJQSxRQUFRO0FBQUEsSUFDTixnQkFBZ0IsS0FBSyxVQUFVLFFBQVEsSUFBSSxlQUFlO0FBQUEsRUFDNUQ7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
