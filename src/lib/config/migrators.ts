import { mainnet, optimism, arbitrum } from "viem/chains";

export const MIGRATORS = {
  eth: {
    [mainnet.id]: "0x2BEFD8E66dC83523DC25732ea558E878819CaB6F",
    [optimism.id]: "0x64bf96e1aa1242092430216a12939109015bd780",
    [arbitrum.id]: "0xb6D30D097773Bf2905aF086B46d9BD269f76910a",
  },
  usd: {
    [mainnet.id]: "0x0d4289008e9e566836EFFEA7664eeb60F2ee6fa9",
    [optimism.id]: "0x0e9e07437bBf496e98cDcDA7A76Fe19294E91eBC",
    [arbitrum.id]: "0x6e94C527e6a1def124EBf5bE38c8c876a541bFFB",
  },
} as const;
