import { mainnet, optimism, arbitrum } from "viem/chains";

export const MIGRATORS = {
  eth: {
    [mainnet.id]: "0x2BEFD8E66dC83523DC25732ea558E878819CaB6F",
    [optimism.id]: "0x9687cD7F685Df154475a5235d9d8ded36d0D7c54",
    [arbitrum.id]: "0x81B1D4318c7950Cf8f1583c74afe3c8FFA1705e8",
  },
  usd: {
    [mainnet.id]: "0x0d4289008e9e566836EFFEA7664eeb60F2ee6fa9",
    [optimism.id]: "0xB0D682E60a08895146fC07b7042A6424328447a5",
    [arbitrum.id]: "0xEcEcc1bbd5A239a8502368a4D98bB104A9f146A9",
  },
} as const;
