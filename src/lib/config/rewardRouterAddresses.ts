import { arbitrum, mainnet, optimism } from "viem/chains";

export const rewardRouterAddresses = {
  [optimism.id]: "0x343910697C03477E5Cc0D386FfA5133d1A827Ad7",
  [arbitrum.id]: "0xaBad1aDaB8A51a00665A3B76DA0E32b2D2F1a6db",
  [mainnet.id]: "0x665f58d975963cdE0C843800DF6178FACBfdADE1",
} as const;

export const rewardTokens = {
  [optimism.id]: {
    rewardTokenAddress: "0x4200000000000000000000000000000000000042",
    rewardTokenSymbol: "OP",
  },
  [arbitrum.id]: {
    rewardTokenAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    rewardTokenSymbol: "ARB",
  },
} as const;
