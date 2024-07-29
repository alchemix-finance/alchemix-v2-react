import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { useTheme } from "./ThemeProvider";

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const { rainbowTheme } = useTheme();
  return (
    <WagmiProvider config={wagmiConfig}>
      <RainbowKitProvider theme={rainbowTheme} showRecentTransactions={true}>
        {children}
      </RainbowKitProvider>
    </WagmiProvider>
  );
};
