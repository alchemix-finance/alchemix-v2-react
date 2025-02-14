import { mainnet, optimism } from "viem/chains";

export const MIGRATORS = {
  eth: {
    [mainnet.id]: "0xF0D5dCC4c1c23B26cd450b302374758b93Ef7203",
    [optimism.id]: "0x477165C1064918E0CE08b370047DbcdFa4fe968e",
  },
  usd: {
    [mainnet.id]: "0xAEff0D3f487F0431318d923f691fF9C484C7564E",
    [optimism.id]: "0x48697Fe7E60DD288946f3Af97F6dDba00Af9ef74",
  },
} as const;
