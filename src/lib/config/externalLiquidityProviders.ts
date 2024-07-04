import { arbitrum, fantom, mainnet, optimism } from "viem/chains";

const defaultSwapProviders = [
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

export const externalLiquidityProviders = {
  [mainnet.id]: defaultSwapProviders,
  [optimism.id]: [
    ...defaultSwapProviders,
    {
      label: "Velodrome",
      url: "https://velodrome.finance/swap",
      icon: "velodrome.svg",
    },
  ],
  [arbitrum.id]: [
    ...defaultSwapProviders,
    {
      label: "Ramses",
      url: "https://app.ramses.exchange/swap",
      icon: "ramses.svg",
    },
  ],
  [fantom.id]: defaultSwapProviders,
};
