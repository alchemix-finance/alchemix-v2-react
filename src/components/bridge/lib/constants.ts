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

export const chainIdToLayerZeroEidMapping = {
  [mainnet.id]: 30101,
  [optimism.id]: 30111,
  [arbitrum.id]: 30110,
  [linea.id]: 30183,
  [metis.id]: 30151,
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

// returns xERC20 on destination chain (for bridging limits check)
export const originToDestinationXTokenAddressMapping: Record<
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

// returns alAsset on mainnet (for lockbox balance check)
export const originToDestinationAlAssetTokenAddressMapping: Record<
  `0x${string}`,
  `0x${string}`
> = {
  [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]:
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
  [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH]:
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
  /*
    alUSD on optimism and arbitrum are the same, so we use the same address for both.
    Thus provide optimism for destination as well.
  */
  [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]:
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
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

type TargetMapping = Record<
  SupportedBridgeChainIds,
  Record<`0x${string}`, `0x${string}`>
>;
type LockboxMapping = Record<`0x${string}`, `0x${string}`>;

export const targetMapping: TargetMapping = {
  [mainnet.id]: {
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]: "0x",
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]: "0x",
    [SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]]: "0x",
    [SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]]: "0x",
    [ALCX_MAINNET_ADDRESS]: "0x",
  },
  [optimism.id]: {
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]: "0x",
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]: "0x",
    [ALCX_OPTIMISM_ADDRESS]: "0x",
  },
  [arbitrum.id]: {
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]: "0x",
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]: "0x",
    [ALCX_ARBITRUM_ADDRESS]: "0x",
  },
  [linea.id]: {
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]: "0x",
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]: "0x",
    [ALCX_LINEA_ADDRESS]: "0x",
  },
  [metis.id]: {
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]: "0x",
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]: "0x",
    [ALCX_METIS_ADDRESS]: "0x",
  },
};

export const lockboxMapping: LockboxMapping = {
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
    "0x9141776017D6A8a8522f913fddFAcAe3e84a7CDb",
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
    "0x2930CDA830B206c84ae8d4CA3F77ec0eAA77a14b",
};

/* QUOTE */

export interface Quote {
  amountOut: string;
  fee: string;
  tx: {
    data: `0x${string}`;
    to: `0x${string}`;
    chainId: SupportedBridgeChainIds;
    value: bigint;
  };
  provider: "LayerZero";
  isLimitExceeded: boolean;
  isOriginSizeExceeded: boolean;
  bridgeLimit: string;
  bridgeCost: { nativeFee: bigint; lzTokenFee: bigint };
  isWrapNeeded: boolean;
}
