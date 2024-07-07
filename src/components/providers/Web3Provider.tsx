import { WagmiProvider, createConfig, http } from "wagmi";
import { createClient } from "viem";
import { mainnet, optimism, arbitrum, fantom } from "viem/chains";
import "@rainbow-me/rainbowkit/styles.css";

import {
  connectorsForWallets,
  RainbowKitProvider,
  lightTheme,
  Theme,
  Chain,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  walletConnectWallet,
  rabbyWallet,
  metaMaskWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";

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

// This overrides the default RPCs for the Optimism chain, thus we can just pass http() transport to the client,
// as it will use the RPCs defined here with fallback transport.
const optimismWithRpcs = {
  ...optimism,
  rpcUrls: {
    default: {
      http: [
        "https://optimism.blockpi.network/v1/rpc/public",
        "https://1rpc.io/op",
        "https://optimism-rpc.publicnode.com",
      ],
    },
  },
} as const satisfies Chain;

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainnet, optimismWithRpcs, arbitrum, fantom],
  client({ chain }) {
    return createClient({
      chain,
      transport: http(),
    });
  },
});

export type SupportedChainId = (typeof wagmiConfig)["chains"][number]["id"];

const rainbowTheme = {
  ...lightTheme(),
  fonts: {
    body: "Montserrat",
  },
} as const satisfies Theme;

export const Web3Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={wagmiConfig}>
    <RainbowKitProvider theme={rainbowTheme} showRecentTransactions={true}>
      {children}
    </RainbowKitProvider>
  </WagmiProvider>
);
