// We overwrite the default RPCs for the Optimism chain, thus we can just pass http() transport to the client,
// as it will use the RPCs defined here with fallback transport.

import { arbitrum, mainnet, optimism, fantom } from "viem/chains";
import type { Chain } from "@rainbow-me/rainbowkit";

const optimismWithRpcs = {
  ...optimism,
  rpcUrls: {
    default: {
      http: [
        "https://optimism.blockpi.network/v1/rpc/public",
        "https://1rpc.io/op",
        "https://optimism-rpc.publicnode.com",
      ],
    },
  },
} as const satisfies Chain;

const mainnetWithRpcs = {
  ...mainnet,
  rpcUrls: {
    default: {
      http: [
        "https://1rpc.io/eth",
        "https://ethereum.blockpi.network/v1/rpc/public",
      ],
    },
  },
} as const satisfies Chain;

const arbitrumWithRpcs = {
  ...arbitrum,
  rpcUrls: {
    default: {
      http: [
        "https://arb1.arbitrum.io/rpc",
        "https://1rpc.io/arb",
        "https://arbitrum-one.publicnode.com",
      ],
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
  optimismWithRpcs,
  mainnetWithRpcs,
  arbitrumWithRpcs,
  fantomWithRpcsAndIcon,
] as const;
