import { arbitrum, fantom, linea, mainnet, metis, optimism } from "viem/chains";

import {
  SYNTHS_TO_XERC20_MAPPING,
  SYNTH_ASSETS_ADDRESSES,
} from "@/lib/config/synths";
import {
  ALCX_ARBITRUM_ADDRESS,
  ALCX_MAINNET_ADDRESS,
  ALCX_OPTIMISM_ADDRESS,
  ALCX_LINEA_ADDRESS,
  ALCX_METIS_ADDRESS,
} from "@/lib/constants";
import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";

/* CHAIN */

export const bridgeChains = [mainnet, optimism, arbitrum, linea, metis];
export type SupportedBridgeChainIds = (typeof bridgeChains)[number]["id"];

export const chainIdToWormholeChainIdMapping = {
  [mainnet.id]: 2,
  [optimism.id]: 24,
  [arbitrum.id]: 23,
} as const;

export const chainIdToDomainMapping = {
  [mainnet.id]: "6648936",
  [optimism.id]: "1869640809",
  [arbitrum.id]: "1634886255",
  [linea.id]: "1818848877",
  [metis.id]: "1835365481",
} as const;

export const getInitialOriginChainId = (originChainId: SupportedChainId) =>
  originChainId === fantom.id ? bridgeChains[0].id : originChainId;
export const getInitialDestinationChainId = (originChainId: SupportedChainId) =>
  bridgeChains.find((c) => c.id !== originChainId)!.id;

/* TOKENS */

type AvailableTokensMapping = Record<SupportedBridgeChainIds, `0x${string}`[]>;

export const chainToAvailableTokensMapping: AvailableTokensMapping = {
  [mainnet.id]: [
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
    SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD],
    SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH],
    ALCX_MAINNET_ADDRESS,
  ],

  [optimism.id]: [
    SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
    ALCX_OPTIMISM_ADDRESS,
  ],

  [arbitrum.id]: [
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
    ALCX_ARBITRUM_ADDRESS,
  ],

  [linea.id]: [
    SYNTH_ASSETS_ADDRESSES[linea.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[linea.id].alETH,
    ALCX_LINEA_ADDRESS,
  ],

  [metis.id]: [
    SYNTH_ASSETS_ADDRESSES[metis.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[metis.id].alETH,
    ALCX_METIS_ADDRESS,
  ],
};

export const originToDestinationTokenAddressMapping: Record<
  `0x${string}`,
  Record<number, `0x${string}`>
> = {
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]: {
    [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
    [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
  },
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]: {
    [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
    [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
  },
  [SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]]: {
    [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
    [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
  },
  [SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]]: {
    [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
    [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
  },
  [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]: {
    [mainnet.id]:
      SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH],
    [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
  },
  [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH]: {
    [mainnet.id]:
      SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH],
    [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
  },
  /*
    alUSD on optimism and arbitrum are the same, so we use the same address for both.
    Thus provide optimism for destination as well.
  */
  [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]: {
    [mainnet.id]:
      SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD],
    [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
    [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
  },
};

export const getInitialOriginTokenAddresses = (chainId: SupportedChainId) => {
  return chainId === fantom.id
    ? chainToAvailableTokensMapping[bridgeChains[0].id]
    : chainToAvailableTokensMapping[chainId];
};
export const getInitialOriginTokenAddress = (chainId: SupportedChainId) => {
  return getInitialOriginTokenAddresses(chainId)[0];
};

/* TARGETS */

type WormholeTargetMapping = Record<
  SupportedBridgeChainIds,
  Record<`0x${string}`, `0x${string}`>
>;
type LockboxMapping = Record<`0x${string}`, `0x${string}`>;
type ConnextTargetMapping = Record<SupportedBridgeChainIds, `0x${string}`>;

export const wormholeTargetMapping: WormholeTargetMapping = {
  [mainnet.id]: {
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
      "0xA9e28396B4259B51444af21B2B80897920917360",
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
      "0x862A205494516e57D33b7F5182fC305E2B17Bc45",
    [SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]]:
      "0xA9e28396B4259B51444af21B2B80897920917360",
    [SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]]:
      "0x862A205494516e57D33b7F5182fC305E2B17Bc45",
  },
  [optimism.id]: {
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]:
      "0xa4158f90Cd65e6E5916BDCa9e3BfE70F511e36E1",
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]:
      "0x9B08D4d6c6a257a5aa2eb0c022B193deedD81CA4",
  },
  [arbitrum.id]: {
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH]:
      "0x07A4D78F8185354E58edcCf01cc0F6766ABD44DF",
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD]:
      "0x19bedE3d7Addf500eC6777384DD48A5715836c85",
  },

  [linea.id]: {},
  [metis.id]: {},
};

export const connextTargetMapping: ConnextTargetMapping = {
  [mainnet.id]: "0x45BF3c737e57B059a5855280CA1ADb8e9606AC68",
  [optimism.id]: "0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA",
  [arbitrum.id]: "0xEE9deC2712cCE65174B561151701Bf54b99C24C8",
  [linea.id]: "0xa05eF29e9aC8C75c530c2795Fa6A800e188dE0a9",
  [metis.id]: "0x6B142227A277CE62808E0Df93202483547Ec0188",
};

export const lockboxMapping: LockboxMapping = {
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
    "0x9141776017D6A8a8522f913fddFAcAe3e84a7CDb",
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
    "0x2930CDA830B206c84ae8d4CA3F77ec0eAA77a14b",
};

/* QUOTES */

interface BaseQuote {
  amountOut: string;
  fee: string;
  tx: {
    data: `0x${string}`;
    to: `0x${string}`;
    chainId: SupportedBridgeChainIds;
    value: bigint;
  };
  provider: "Connext" | "Wormhole";
  bridgeCost?: string;
  isWrapNeeded?: boolean;
  isLimitExceeded?: boolean;
}

interface ConnextQuote extends BaseQuote {
  provider: "Connext";
  bridgeCost?: never;
  isWrapNeeded?: never;
  isLimitExceeded?: never;
}

interface WormholeQuote extends BaseQuote {
  provider: "Wormhole";
  bridgeCost: string;
  isWrapNeeded: boolean;
  isLimitExceeded?: boolean;
}

export type BridgeQuote = ConnextQuote | WormholeQuote;
