import { WagmiProvider } from "wagmi";
import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, lightTheme, Theme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";

const lightThemeNoBorderRadius = lightTheme({
  borderRadius: "none",
});

const rainbowLightTheme = {
  ...lightThemeNoBorderRadius,
  fonts: {
    body: "Montserrat",
  },
  shadows: {
    connectButton: "none",
    dialog: "none",
    profileDetailsAction: "none",
    selectedOption: "none",
    selectedWallet: "none",
    walletLogo: "none",
  },
  colors: {
    ...lightThemeNoBorderRadius.colors,
    accentColor: "#0a3a60",
    accentColorForeground: "#dcd7cc",
    connectButtonBackground: "#DEDBD3",
    connectButtonInnerBackground: "#E8E4DB",
    modalBackground: "#D6D2C6",
    modalBorder: "#DEDBD3",
    modalText: "#000",
    modalTextSecondary: "#68645d",
    profileAction: "#dcd7cc",
    profileActionHover: "#DEDBD3",
  },
} as const satisfies Theme;

export const Web3Provider = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={wagmiConfig}>
    <RainbowKitProvider theme={rainbowLightTheme} showRecentTransactions={true}>
      {children}
    </RainbowKitProvider>
  </WagmiProvider>
);
