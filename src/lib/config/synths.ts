import { SynthAssetMetadata } from "@/lib/config/metadataTypes";

export const SYNTH_ASSETS = {
  ALUSD: "alUSD",
  ALETH: "alETH",
} as const;

export type SynthAsset = (typeof SYNTH_ASSETS)[keyof typeof SYNTH_ASSETS];

export const SYNTH_ASSETS_METADATA = {
  [SYNTH_ASSETS.ALUSD]: {
    label: "alUSD",
    icon: "/images/icons/alusd_med.svg",
  },
  [SYNTH_ASSETS.ALETH]: {
    label: "alETH",
    icon: "/images/icons/aleth_med.svg",
  },
} as const satisfies SynthAssetMetadata;
