/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WC_PROJECT_ID: string;
  readonly VITE_SUBGRAPH_API_KEY: string;
  readonly VITE_INFURA_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// NOTE: only works if we use vercel for deployment
declare const __VERCEL_ENV__:
  | "preview"
  | "production"
  | "development"
  | undefined;
