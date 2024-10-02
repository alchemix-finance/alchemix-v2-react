import { SynthAssetMetadata } from "@/lib/config/metadataTypes";
import { arbitrum, mainnet, optimism } from "viem/chains";

export const SYNTH_ASSETS = {
  ALUSD: "alUSD",
  ALETH: "alETH",
} as const;

export type SynthAsset = (typeof SYNTH_ASSETS)[keyof typeof SYNTH_ASSETS];

export const SYNTH_ASSETS_METADATA = {
  [SYNTH_ASSETS.ALUSD]: {
    label: "alUSD",
    icon: "./images/icons/alusd_med.svg",
  },
  [SYNTH_ASSETS.ALETH]: {
    label: "alETH",
    icon: "./images/icons/aleth_med.svg",
  },
} as const satisfies SynthAssetMetadata;

export const SYNTH_ASSETS_ADDRESSES = {
  [mainnet.id]: {
    [SYNTH_ASSETS.ALUSD]: "0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9",
    [SYNTH_ASSETS.ALETH]: "0x0100546F2cD4C9D97f798fFC9755E47865FF7Ee6",
  },
  [optimism.id]: {
    [SYNTH_ASSETS.ALUSD]: "0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A",
    [SYNTH_ASSETS.ALETH]: "0x3E29D3A9316dAB217754d13b28646B76607c5f04",
  },
  [arbitrum.id]: {
    [SYNTH_ASSETS.ALUSD]: "0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A",
    [SYNTH_ASSETS.ALETH]: "0x17573150d67d820542EFb24210371545a4868B03",
  },
} as const;
