import { arbitrum, fantom, mainnet, optimism } from "viem/chains";

const DEFAULT_SWAP_PROVIDERS = [
  {
    label: "LlamaSwap",
    url: "https://swap.defillama.com/",
    icon: "llamaswap.png",
  },
  {
    label: "Paraswap",
    url: "https://app.paraswap.io/",
    icon: "paraswap.png",
  },
  {
    label: "OpenOcean",
    url: "https://app.openocean.finance/swap/eth/ETH/ALETH",
    icon: "openocean.png",
  },
  {
    label: "Curve",
    url: "https://curve.fi/",
    icon: "crv.png",
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
