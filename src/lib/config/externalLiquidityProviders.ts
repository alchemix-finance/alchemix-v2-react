import { arbitrum, fantom, mainnet, optimism } from "viem/chains";

const DEFAULT_SWAP_PROVIDERS = [
  {
    label: "Curve",
    url: "https://curve.fi/",
    icon: "crv.png",
  },
  {
    label: "Paraswap",
    url: "https://app.paraswap.io/",
    icon: "paraswap.png",
  },
  {
    label: "Zapper",
    url: "https://zapper.xyz/",
    icon: "zapper.png",
  },
  {
    label: "LlamaSwap",
    url: "https://swap.defillama.com/",
    icon: "llamaswap.png",
  },
];

export const EXTERNAL_LIQUIDITY_PROVIDERS = {
  [mainnet.id]: DEFAULT_SWAP_PROVIDERS,
  [optimism.id]: [
    ...DEFAULT_SWAP_PROVIDERS,
    {
      label: "Velodrome",
      url: "https://velodrome.finance/swap",
      icon: "velodrome.svg",
    },
  ],
  [arbitrum.id]: [
    ...DEFAULT_SWAP_PROVIDERS,
    {
      label: "Ramses",
      url: "https://app.ramses.exchange/swap",
      icon: "ramses.svg",
    },
  ],
  [fantom.id]: DEFAULT_SWAP_PROVIDERS,
};
