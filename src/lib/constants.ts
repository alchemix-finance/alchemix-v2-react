import { arbitrum, mainnet, optimism } from "viem/chains";

// Gas doesn't have an address, but we use this to handle gas logic in the app
export const GAS_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
// Some APIs require zero address when dealing with GAS
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

// Time constants
export const ONE_MINUTE_IN_MS = 60 * 1000;
export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
export const FIVE_MIN_IN_MS = 300000;

// Addresses used in the app
export const DELEGATE_REGISTRY_ADDRESS =
  "0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446";
export const WETH_MAINNET_ADDRESS =
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
export const ALCX_MAINNET_ADDRESS =
  "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF";
export const ALCX_ARBITRUM_ADDRESS =
  "0x27b58D226fe8f792730a795764945Cf146815AA7";
export const ALCX_OPTIMISM_ADDRESS =
  "0xE974B9b31dBFf4369b94a1bAB5e228f35ed44125";
export const G_ALCX_MAINNET_ADDRESS =
  "0x93Dede06AE3B5590aF1d4c111BC54C3f717E4b35";
export const SUSHI_MAINNET_ADDRESS =
  "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2";
export const CRV_MAINNET_ADDRESS = "0xd533a949740bb3306d119cc777fa900ba034cd52";
export const USDT_MAINNET_ADDRESS =
  "0xdAC17F958D2ee523a2206206994597C13D831ec7";
export const WETH_ADDRESSES = {
  [mainnet.id]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [arbitrum.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  [optimism.id]: "0x4200000000000000000000000000000000000006",
} as const;

// Number constants
export const MAX_UINT256_BN = BigInt(Math.pow(2, 256)) - 1n;
