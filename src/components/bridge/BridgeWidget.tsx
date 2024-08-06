import type { WidgetConfig } from "@lifi/widget";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Suspense, lazy, useMemo } from "react";
import { useTheme } from "../providers/ThemeProvider";
import { BridgeFallback } from "./BridgeFallback";

const LiFiWidget = lazy(() =>
  import("@lifi/widget").then((module) => ({ default: module.LiFiWidget })),
);

const widgetConfig = {
  integrator: "Alchemix",
  variant: "wide",

  // Bridge configuration
  fromChain: mainnet.id,
  toChain: arbitrum.id,
  chains: {
    allow: [mainnet.id, arbitrum.id, optimism.id],
  },
  fromToken: "0xbc6da0fe9ad5f3b0d58160288917aa56653660e9",
  toToken: "0xcb8fa9a76b8e203d8c3797bf438d8fb81ea3326a",
  tokens: {
    featured: [
      {
        address: "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9",
        chainId: mainnet.id,
        decimals: 18,
        name: "Alchemix USD",
        symbol: "alUSD",
        // lifi has wrong logoURI for alUSD
        logoURI:
          "https://assets.coingecko.com/coins/images/14114/standard/Alchemix_USD.png",
      },
      {
        address: "0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A",
        chainId: arbitrum.id,
        decimals: 18,
        name: "Alchemix USD",
        symbol: "alUSD",
      },
      {
        address: "0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A",
        chainId: optimism.id,
        decimals: 18,
        name: "Alchemix USD",
        symbol: "alUSD",
      },
      {
        address: "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF",
        chainId: mainnet.id,
        decimals: 18,
        name: "Alchemix",
        symbol: "ALCX",
      },
      {
        address: "0x27b58D226fe8f792730a795764945Cf146815AA7",
        chainId: arbitrum.id,
        decimals: 18,
        name: "Alchemix",
        symbol: "ALCX",
        // lifi doesnt have logoURI for ALCX on arbitrum
        logoURI:
          "https://assets.coingecko.com/coins/images/14113/standard/Alchemix.png",
      },
    ],
  },
} satisfies WidgetConfig;

export const BridgeWidget = () => {
  const { darkMode } = useTheme();

  const { openConnectModal } = useConnectModal();

  const config = useMemo(() => {
    return {
      ...widgetConfig,
      appearance: darkMode ? "dark" : "light",
      theme: {
        typography: {
          fontFamily: "Montserrat, sans-serif",
        },
        container: {
          border: darkMode ? "1px solid #20242C" : "1px solid #DEDBD3",
          borderRadius: "8px",
        },
        palette: {
          background: {
            default: darkMode ? "#171B24" : "#E8E4DB",
            paper: darkMode ? "#20242C" : "#DEDBD3",
          },
          text: {
            primary: darkMode ? "#f5f5f5" : "#0A0A0A",
            secondary: "#979BA2",
          },
        },
      },
      walletConfig: {
        onConnect: openConnectModal,
      },
    } satisfies WidgetConfig;
  }, [darkMode, openConnectModal]);

  return (
    <Suspense fallback={<BridgeFallback />}>
      <LiFiWidget integrator="Alchemix" config={config} />
    </Suspense>
  );
};
