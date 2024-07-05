import { LiFiWidget, WidgetConfig } from "@lifi/widget";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { useConnectModal } from "@rainbow-me/rainbowkit";

const widgetConfig: WidgetConfig = {
  integrator: "Alchemix",
  variant: "wide",
  theme: {
    typography: {
      fontFamily: "Montserrat, sans-serif",
    },
    container: {
      border: "1px solid #DEDBD3",
      borderRadius: "8px",
    },
    palette: {
      background: {
        default: "#E8E4DB",
        paper: "#DEDBD3",
      },
    },
  },

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
};

export const BridgeWidget = () => {
  const { openConnectModal } = useConnectModal();
  return (
    <LiFiWidget
      integrator="Alchemix"
      config={{
        ...widgetConfig,
        walletConfig: {
          onConnect: openConnectModal,
        },
      }}
    />
  );
};
