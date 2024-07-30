import { createConfig, http } from "wagmi";
import { createClient, fallback } from "viem";
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

const projectId = import.meta.env.VITE_WC_PROJECT_ID;

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
      transport: fallback(
        chain.rpcUrls.default.http.map((rpcUrl) => http(rpcUrl)),
      ),
    });
  },
});

export type SupportedChainId = (typeof wagmiConfig)["chains"][number]["id"];
