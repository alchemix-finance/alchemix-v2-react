import { WagmiProvider, createConfig, http } from "wagmi";
import { createClient } from "viem";
import { mainnet, optimism, arbitrum, fantom } from "viem/chains";
import "@rainbow-me/rainbowkit/styles.css";

import {
  connectorsForWallets,
  RainbowKitProvider,
  lightTheme,
  Theme,
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

export const wagmiConfig = createConfig({
  connectors,
  chains: [mainnet, optimism, arbitrum, fantom],
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
