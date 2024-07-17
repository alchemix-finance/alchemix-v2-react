import { createConfig, http } from "wagmi";
import { createClient } from "viem";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  walletConnectWallet,
  rabbyWallet,
  metaMaskWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { tenderlyForkChain } from "./tenderly";
import { chains } from "./chains";

const projectId = "50142a32098234f9b609a09096df9be5";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        injectedWallet,
        rabbyWallet,
        metaMaskWallet,
        walletConnectWallet,
        coinbaseWallet,
      ],
    },
  ],
  {
    projectId,
    appName: "Alchemix",
  },
);

export const wagmiConfig = createConfig({
  connectors,
  chains: tenderlyForkChain ? [tenderlyForkChain] : chains,
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    });
  },
});

export type SupportedChainId = (typeof wagmiConfig)["chains"][number]["id"];
