/**
 * We override the rpcUrls for each chain to use our own list of rpcs.
 * If the app is running on the production url, we use infura rpcs.
 */

import { arbitrum, mainnet, optimism, fantom, linea, metis } from "viem/chains";
import type { Chain } from "@rainbow-me/rainbowkit";

const IS_VERCEL_PRODUCTION = __VERCEL_ENV__ === "production";
const MAINNET_BLAST_RPC = import.meta.env.VITE_BLAST_MAINNET_API_KEY;
const OPTIMISM_BLAST_RPC = import.meta.env.VITE_BLAST_OPTIMISM_API_KEY;
const ARBITRUM_BLAST_RPC = import.meta.env.VITE_BLAST_ARBITRUM_API_KEY;

const mainnetRpcs = IS_VERCEL_PRODUCTION
  ? [MAINNET_BLAST_RPC, "https://ethereum-rpc.publicnode.com"]
  : [
      "https://1rpc.io/eth",
      "https://ethereum-rpc.publicnode.com",
      "https://ethereum.blockpi.network/v1/rpc/public",
      "https://eth.drpc.org",
      "https://eth-mainnet.public.blastapi.io",
      "https://rpc.ankr.com/eth",
    ];

const mainnetWithRpcs = {
  ...mainnet,
  rpcUrls: {
    default: {
      http: mainnetRpcs,
    },
  },
} as const satisfies Chain;

const optimismRpcs = IS_VERCEL_PRODUCTION
  ? [OPTIMISM_BLAST_RPC, "https://optimism-rpc.publicnode.com"]
  : [
      "https://optimism.blockpi.network/v1/rpc/public",
      "https://1rpc.io/op",
      "https://optimism-rpc.publicnode.com",
      "https://optimism-mainnet.public.blastapi.io",
      "https://rpc.ankr.com/optimism",
    ];

const optimismWithRpcs = {
  ...optimism,
  rpcUrls: {
    default: {
      http: optimismRpcs,
    },
  },
} as const satisfies Chain;

const arbitrumRpcs = IS_VERCEL_PRODUCTION
  ? [ARBITRUM_BLAST_RPC, "https://arbitrum-one-rpc.publicnode.com"]
  : [
      "https://arb1.arbitrum.io/rpc",
      "https://1rpc.io/arb",
      "https://arbitrum-one.publicnode.com",
      "https://arbitrum-one-rpc.publicnode.com",
      "https://rpc.ankr.com/arbitrum",
      "https://arbitrum-one.public.blastapi.io",
    ];

const arbitrumWithRpcs = {
  ...arbitrum,
  rpcUrls: {
    default: {
      http: arbitrumRpcs,
    },
  },
} as const satisfies Chain;

const fantomWithRpcsAndIcon = {
  ...fantom,
  rpcUrls: {
    default: {
      http: [
        "https://rpc.ankr.com/fantom",
        "https://fantom-rpc.publicnode.com",
        "https://1rpc.io/ftm",
        "https://fantom.blockpi.network/v1/rpc/public",
      ],
    },
  },
  iconUrl: "/images/icons/fantom_blue.svg",
} as const satisfies Chain;

const lineaWithRpcs = {
  ...linea,
  rpcUrls: {
    default: {
      http: ["https://linea.drpc.org", "https://linea-rpc.publicnode.com"],
    },
  },
};

const metisWithRpcs = {
  ...metis,
  rpcUrls: {
    default: {
      http: ["https://metis.drpc.org", "https://metis-rpc.publicnode.com"],
    },
  },
};

export const chains = [
  mainnetWithRpcs,
  optimismWithRpcs,
  arbitrumWithRpcs,
  fantomWithRpcsAndIcon,
  lineaWithRpcs,
  metisWithRpcs,
] as const;
