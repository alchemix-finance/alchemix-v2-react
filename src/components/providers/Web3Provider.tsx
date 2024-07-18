import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, lightTheme, Theme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";

const rainbowLightTheme = {
  ...lightTheme({
    borderRadius: "none",
  }),
  fonts: {
    body: "Montserrat",
  },
} as const satisfies Theme;

export const Web3Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={wagmiConfig}>
    <RainbowKitProvider theme={rainbowLightTheme} showRecentTransactions={true}>
      {children}
    </RainbowKitProvider>
  </WagmiProvider>
);
