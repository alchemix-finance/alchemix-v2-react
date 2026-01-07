/**
 * We override the rpcUrls for each chain to use our own list of rpcs.
 * If the app is running on the production url, we use infura rpcs.
 */

import {
  arbitrum,
  mainnet,
  optimism,
  fantom,
  linea,
  metis,
  base,
} from "viem/chains";
import type { Chain } from "@rainbow-me/rainbowkit";

const IS_VERCEL_PRODUCTION = __VERCEL_ENV__ === "production";
const MAINNET_DRPC_RPC = import.meta.env.VITE_DRPC_MAINNET_API_KEY;
const OPTIMISM_DRPC_RPC = import.meta.env.VITE_DRPC_OPTIMISM_API_KEY;
const ARBITRUM_DRPC_RPC = import.meta.env.VITE_DRPC_ARBITRUM_API_KEY;

const mainnetRpcs = IS_VERCEL_PRODUCTION
  ? [MAINNET_DRPC_RPC, "https://ethereum-rpc.publicnode.com"]
  : [
      "https://1rpc.io/eth",
      "https://ethereum-rpc.publicnode.com",
      "https://ethereum.blockpi.network/v1/rpc/public",
      "https://eth.drpc.org",
      "https://eth-mainnet.public.blastapi.io",
      "https://rpc.ankr.com/eth",
    ];

const optimismRpcs = IS_VERCEL_PRODUCTION
  ? [OPTIMISM_DRPC_RPC, "https://optimism-rpc.publicnode.com"]
  : [
      "https://1rpc.io/op",
      "https://optimism-rpc.publicnode.com",
      "https://optimism-mainnet.public.blastapi.io",
      "https://rpc.ankr.com/optimism",
      "https://optimism.blockpi.network/v1/rpc/public",
    ];

const arbitrumRpcs = IS_VERCEL_PRODUCTION
  ? [ARBITRUM_DRPC_RPC, "https://arbitrum-one-rpc.publicnode.com"]
  : [
      "https://arb1.arbitrum.io/rpc",
      "https://1rpc.io/arb",
      "https://arbitrum-one.publicnode.com",
      "https://arbitrum-one-rpc.publicnode.com",
      "https://rpc.ankr.com/arbitrum",
      "https://arbitrum-one.public.blastapi.io",
    ];

const fantomRpcs = [
  "https://rpc.ankr.com/fantom",
  "https://fantom-rpc.publicnode.com",
  "https://1rpc.io/ftm",
  "https://fantom.blockpi.network/v1/rpc/public",
];

const lineaRpcs = [
  "https://linea.drpc.org",
  "https://linea-rpc.publicnode.com",
];

const metisRpcs = [
  "https://metis.drpc.org",
  "https://metis-rpc.publicnode.com",
];

const baseRpcs = ["https://1rpc.io/base", "https://base-rpc.publicnode.com"];

export const RPCS = {
  [mainnet.id]: mainnetRpcs,
  [optimism.id]: optimismRpcs,
  [arbitrum.id]: arbitrumRpcs,
  [fantom.id]: fantomRpcs,
  [linea.id]: lineaRpcs,
  [metis.id]: metisRpcs,
  [base.id]: baseRpcs,
} as const;

export const fantomWithIcon = {
  ...fantom,
  iconUrl: "/images/icons/fantom_blue.svg",
} as const satisfies Chain;

export const chains = [
  mainnet,
  optimism,
  arbitrum,
  fantomWithIcon,
  linea,
  base,
  metis,
] as const;
