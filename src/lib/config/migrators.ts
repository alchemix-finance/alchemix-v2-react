import { mainnet, optimism } from "viem/chains";

export const MIGRATORS = {
  eth: {
    [mainnet.id]: "0x0E17934B9735D479B2388347fAeF0F4e58b9cc06",
    [optimism.id]: "0x477165C1064918E0CE08b370047DbcdFa4fe968e",
  },
  usd: {
    [mainnet.id]: "0x303241e2B3b4aeD0bb0F8623e7442368FED8Faf3",
    [optimism.id]: "0x48697Fe7E60DD288946f3Af97F6dDba00Af9ef74",
  },
} as const;
