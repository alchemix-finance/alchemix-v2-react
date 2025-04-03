import { arbitrum, mainnet, optimism } from "viem/chains";

export const REWARD_ROUTER_ADDRESSES = {
  [optimism.id]: "0x343910697C03477E5Cc0D386FfA5133d1A827Ad7",
  [arbitrum.id]: "0xaBad1aDaB8A51a00665A3B76DA0E32b2D2F1a6db",
  [mainnet.id]: "0x665f58d975963cdE0C843800DF6178FACBfdADE1",
} as const;

export const REWARD_TOKENS = {
  [optimism.id]: {
    rewardTokenAddress: "0x4200000000000000000000000000000000000042",
    rewardTokenSymbol: "OP",
  },
  [arbitrum.id]: {
    rewardTokenAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
    rewardTokenSymbol: "ARB",
  },
} as const;

export const BONUS_REWARDS_END_TIMESTAMPS: Record<
  typeof optimism.id | typeof arbitrum.id,
  Record<`0x${string}`, number>
> = {
  [optimism.id]: {
    // Lido wstETH December 13th
    "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb": 1752192000,
    // Aave aUSDC July 3rd
    "0x4186Eb285b1efdf372AC5896a08C346c7E373cC4": 1751551200,
    // Aave aWETH July 3rd
    "0x337B4B933d60F40CB57DD19AE834Af103F049810": 1751551200,
  },
  // September 28th
  [arbitrum.id]: {
    // Aave aUSDC
    "0x248a431116c6f6FCD5Fe1097d16d0597E24100f5": 1733315207,
    // Jones jUSDC
    "0xB0BDE111812EAC913b392D80D51966eC977bE3A2": 1733315207,
    // Lido wstETH
    "0x5979D7b546E38E414F7E9822514be443A4800529": 1733315207,
    // Gearbox WETH
    "0xf3b7994e4dA53E04155057Fd61dc501599d57877": 1733315207,
  },
};
