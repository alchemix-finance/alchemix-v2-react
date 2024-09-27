import { mainnet, optimism } from "viem/chains";

export const MIGRATORS = {
  eth: {
    [mainnet.id]: "0x0E17934B9735D479B2388347fAeF0F4e58b9cc06",
    [optimism.id]: "0x4bb3D9BB460553239CcfF1f742a3322Bc44816f5",
  },
  usd: {
    [mainnet.id]: "0x303241e2B3b4aeD0bb0F8623e7442368FED8Faf3",
    [optimism.id]: "0xa64cc2829A850d145e658ea49A1F1165C2e87a1C",
  },
} as const;
