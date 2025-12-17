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
import { Buffer } from "buffer";

import { chains, RPCS } from "./chains";
import { tenderlyForkChain } from "./tenderly";

const projectId = import.meta.env.VITE_WC_PROJECT_ID;

// https://github.com/wevm/wagmi/issues/261
if (!window.Buffer) {
  window.Buffer = Buffer;
}

// Alchemix v2 doesn't support contract wallets
coinbaseWallet.preference = {
  options: "eoaOnly",
};

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

export const defaultWagmiConfig = createConfig({
  connectors,
  chains,
  client({ chain }) {
    return createClient({
      chain,
      transport: fallback(RPCS[chain.id].map((rpc) => http(rpc))),
      batch: {
        multicall: true,
      },
    });
  },
});

export const debugWagmiConfig = tenderlyForkChain
  ? createConfig({
      connectors,
      chains: [tenderlyForkChain],
      client({ chain }) {
        return createClient({
          chain,
          transport: fallback(
            chain.rpcUrls.default.http.map((rpc) => http(rpc)),
          ),
          batch: {
            multicall: true,
          },
        });
      },
    })
  : undefined;

export const wagmiConfig = debugWagmiConfig ?? defaultWagmiConfig;

export type SupportedChainId = (typeof wagmiConfig)["chains"][number]["id"];
