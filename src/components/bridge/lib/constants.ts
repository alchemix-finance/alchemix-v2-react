import { zeroAddress } from "viem";
import {
  arbitrum,
  fantom,
  linea,
  mainnet,
  metis,
  optimism,
  base,
} from "viem/chains";

import { SYNTH_ASSETS_ADDRESSES } from "@/lib/config/synths";
import {
  ALCX_ARBITRUM_ADDRESS,
  ALCX_MAINNET_ADDRESS,
  ALCX_OPTIMISM_ADDRESS,
  ALCX_LINEA_ADDRESS,
  ALCX_METIS_ADDRESS,
} from "@/lib/constants";
import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";

/* CHAIN */

export const bridgeChains = [mainnet, optimism, arbitrum, linea, metis, base];
export type SupportedBridgeChainIds = (typeof bridgeChains)[number]["id"];

export const chainIdToLayerZeroEidMapping = {
  [mainnet.id]: 30101,
  [optimism.id]: 30111,
  [arbitrum.id]: 30110,
  [linea.id]: 30183,
  [metis.id]: 30151,
  [base.id]: 30184,
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
    // ALCX_MAINNET_ADDRESS,
  ],

  [optimism.id]: [
    SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
    // ALCX_OPTIMISM_ADDRESS,
  ],

  [arbitrum.id]: [
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
    // ALCX_ARBITRUM_ADDRESS,
  ],

  [linea.id]: [
    SYNTH_ASSETS_ADDRESSES[linea.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[linea.id].alETH,
    // ALCX_LINEA_ADDRESS,
  ],

  [metis.id]: [
    SYNTH_ASSETS_ADDRESSES[metis.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[metis.id].alETH,
    // ALCX_METIS_ADDRESS,
  ],

  [base.id]: [
    SYNTH_ASSETS_ADDRESSES[base.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[base.id].alETH,
  ],
};

export const originToDestinationAlAssetTokenAddressMapping: Record<
  SupportedBridgeChainIds,
  Record<`0x${string}`, Record<number, `0x${string}`>>
> = {
  [mainnet.id]: {
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]: {
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alETH,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alETH,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alETH,
    },
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]: {
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alUSD,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alUSD,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alUSD,
    },
  },
  [optimism.id]: {
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alETH,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alETH,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alETH,
    },
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alUSD,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alUSD,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alUSD,
    },
  },
  [arbitrum.id]: {
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alETH,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alETH,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alETH,
    },
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alUSD,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alUSD,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alUSD,
    },
  },
  [linea.id]: {
    [SYNTH_ASSETS_ADDRESSES[linea.id].alETH]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alETH,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alETH,
    },
    [SYNTH_ASSETS_ADDRESSES[linea.id].alUSD]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alUSD,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alUSD,
    },
  },
  [metis.id]: {
    [SYNTH_ASSETS_ADDRESSES[metis.id].alETH]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alETH,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alETH,
    },
    [SYNTH_ASSETS_ADDRESSES[metis.id].alUSD]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alUSD,
      [base.id]: SYNTH_ASSETS_ADDRESSES[base.id].alUSD,
    },
  },
  [base.id]: {
    [SYNTH_ASSETS_ADDRESSES[base.id].alETH]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alETH,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alETH,
    },
    [SYNTH_ASSETS_ADDRESSES[base.id].alUSD]: {
      [mainnet.id]: SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
      [optimism.id]: SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
      [arbitrum.id]: SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
      [linea.id]: SYNTH_ASSETS_ADDRESSES[linea.id].alUSD,
      [metis.id]: SYNTH_ASSETS_ADDRESSES[metis.id].alUSD,
    },
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

/* TARGET */

type TargetMapping = Record<
  SupportedBridgeChainIds,
  Record<`0x${string}`, `0x${string}`>
>;

export const targetMapping: TargetMapping = {
  [mainnet.id]: {
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
      "0xf21056882A3CeE5b664d2076a518BbB931Af0e14",
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
      "0xE0d147f23906A723AE1C10753E84A486A7795471",
    [ALCX_MAINNET_ADDRESS]: zeroAddress,
  },
  [optimism.id]: {
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]:
      "0x98b43d8C759df19201d84716846C03f4B96A206B",
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]:
      "0xd64aB29cC101E421eE3F4B0eaa721925395dDc05",
    [ALCX_OPTIMISM_ADDRESS]: zeroAddress,
  },
  [arbitrum.id]: {
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH]:
      "0x98b43d8C759df19201d84716846C03f4B96A206B",
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD]:
      "0xd64aB29cC101E421eE3F4B0eaa721925395dDc05",
    [ALCX_ARBITRUM_ADDRESS]: zeroAddress,
  },
  [linea.id]: {
    [SYNTH_ASSETS_ADDRESSES[linea.id].alETH]:
      "0xEf0C255f7A46Be3358E066BBc27B5850b5F3DEF9",
    [SYNTH_ASSETS_ADDRESSES[linea.id].alUSD]:
      "0x48Cc5276C1c3eef21Fa3350015Fbe4Af726114BF",
    [ALCX_LINEA_ADDRESS]: zeroAddress,
  },
  [metis.id]: {
    [SYNTH_ASSETS_ADDRESSES[metis.id].alETH]:
      "0x9D25293c5E90Dd309dc144c7913a3bD0D2471497",
    [SYNTH_ASSETS_ADDRESSES[metis.id].alUSD]:
      "0x1d60ec09D68147e511b490FF07c794B3f9DeD5a9",
    [ALCX_METIS_ADDRESS]: zeroAddress,
  },
  [base.id]: {
    [SYNTH_ASSETS_ADDRESSES[base.id].alETH]:
      "0xA173e7Dd7fa6768dBa83A7434a3d623CCCD78022",
    [SYNTH_ASSETS_ADDRESSES[base.id].alUSD]:
      "0x5Bfb6dc04DC801873F70498944218eEadeDDad17",
  },
};

/* LOCKBOX */

type LockboxMapping = Record<`0x${string}`, `0x${string}`>;

export const lockboxMapping: LockboxMapping = {
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
    "0xf21056882A3CeE5b664d2076a518BbB931Af0e14",
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
    "0xE0d147f23906A723AE1C10753E84A486A7795471",
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
  isFromMainnetLockboxBalanceExceeded: boolean;
  isDestinationBridgeLimitExceeded: boolean;
  isToMainnetLockboxBalanceExceeded: boolean;
  destinationBridgeLimit: string;
  toMainnetLockboxBalance: string;
  bridgeCost: { nativeFee: bigint; lzTokenFee: bigint };
}

export interface RecoveryQuote {
  xAlAssetBalance: bigint;
  xAlAssetBalanceFormatted: string;
  alAssetLockboxLiquidity: bigint;
  alAssetLockboxLiquidityFormatted: string;
  tx: {
    to: `0x${string}`;
    data: `0x${string}`;
    chainId: 1;
  };
}
