import { mainnet, optimism } from "viem/chains";

export const MIGRATORS = {
  eth: {
    [mainnet.id]: "0x0E17934B9735D479B2388347fAeF0F4e58b9cc06",
    [optimism.id]: "0x00E33722ba54545667E76a18CE9D544130eEAbcC",
  },
  usd: {
    [mainnet.id]: "0x303241e2B3b4aeD0bb0F8623e7442368FED8Faf3",
    [optimism.id]: "0x752cA40117180129410b5E3529AEdEB6Efa22e2b",
  },
} as const;
