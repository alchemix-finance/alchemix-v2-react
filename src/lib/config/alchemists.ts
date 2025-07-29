import { zeroAddress } from "viem";
import {
  arbitrum,
  mainnet,
  optimism,
  fantom,
  linea,
  metis,
  base,
} from "viem/chains";
import type { AlchemistsMetadata } from "@/lib/config/metadataTypes";
import { SYNTH_ASSETS } from "@/lib/config/synths";

export const ALCHEMISTS_METADATA = {
  [mainnet.id]: {
    [SYNTH_ASSETS.ALUSD]: "0x5C6374a2ac4EBC38DeA0Fc1F8716e5Ea1AdD94dd",
    [SYNTH_ASSETS.ALETH]: "0x062Bf725dC4cDF947aa79Ca2aaCCD4F385b13b5c",
  },
  [fantom.id]: {
    [SYNTH_ASSETS.ALUSD]: "0x76b2E3c5a183970AAAD2A48cF6Ae79E3e16D3A0E",
    [SYNTH_ASSETS.ALETH]: zeroAddress,
  },
  [optimism.id]: {
    [SYNTH_ASSETS.ALUSD]: "0x10294d57A419C8eb78C648372c5bAA27fD1484af",
    [SYNTH_ASSETS.ALETH]: "0xe04Bb5B4de60FA2fBa69a93adE13A8B3B569d5B4",
  },
  [arbitrum.id]: {
    [SYNTH_ASSETS.ALUSD]: "0xb46eE2E4165F629b4aBCE04B7Eb4237f951AC66F",
    [SYNTH_ASSETS.ALETH]: "0x654e16a0b161b150F5d1C8a5ba6E7A7B7760703A",
  },
  [linea.id]: {
    [SYNTH_ASSETS.ALUSD]: zeroAddress,
    [SYNTH_ASSETS.ALETH]: zeroAddress,
  },
  [metis.id]: {
    [SYNTH_ASSETS.ALUSD]: zeroAddress,
    [SYNTH_ASSETS.ALETH]: zeroAddress,
  },
  [base.id]: {
    [SYNTH_ASSETS.ALUSD]: zeroAddress,
    [SYNTH_ASSETS.ALETH]: zeroAddress,
  },
} as const satisfies AlchemistsMetadata;
