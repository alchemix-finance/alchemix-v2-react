/**
 * We override the rpcUrls for each chain to use our own list of rpcs.
 * If the app is running on the production url, we use infura rpcs.
 */

import { arbitrum, mainnet, optimism, fantom } from "viem/chains";
import type { Chain } from "@rainbow-me/rainbowkit";

const INFURA_KEY = import.meta.env.VITE_INFURA_API_KEY;

const mainnetRpcs =
  __VERCEL_ENV__ === "production"
    ? [`https://mainnet.infura.io/v3/${INFURA_KEY}`]
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

const optimismRpcs =
  __VERCEL_ENV__ === "production"
    ? [`https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`]
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

const arbitrumRpcs =
  __VERCEL_ENV__ === "production"
    ? [`https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`]
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

export const chains = [
  mainnetWithRpcs,
  optimismWithRpcs,
  arbitrumWithRpcs,
  fantomWithRpcsAndIcon,
] as const;
