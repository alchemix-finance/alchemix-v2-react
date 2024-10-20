import { arbitrum, fantom, mainnet, optimism } from "viem/chains";
import type { TransmutersMetadata } from "@/lib/config/metadataTypes";
import { SYNTH_ASSETS } from "@/lib/config/synths";
import {strategyMainnetAbi} from "@/abi/transmuter-looping-vaults/strategyMainnet";
import {strategyArbAbi} from "@/abi/transmuter-looping-vaults/strategyArb";
import {strategyOpAbi} from "@/abi/transmuter-looping-vaults/strategyOp";

export const TRANSMUTER_LOOPERS_VAULTS = {
  [mainnet.id]: [
    {
      address: "0x...", // TODO - replace with address for StrategyMainnet
      synthAsset: SYNTH_ASSETS.ALETH,
      label: "ALETH Transmuter Looper",
      aprQueryUri: "",
      abi: strategyMainnetAbi
    }
  ],
  [arbitrum.id]: [
    {
      address: "0x...", // TODO - replace with address for StrategyArb
      synthAsset: SYNTH_ASSETS.ALETH,
      label: "Arbitrum ALETH Transmuter Looper",
      aprQueryUri: "",
      abi: strategyArbAbi
    }
  ],
  [optimism.id]: [
    {
      address: "0x...", // TODO - replace with address for StrategyOp
      synthAsset: SYNTH_ASSETS.ALETH,
      label: "Optimism ALETH Transmuter Looper",
      aprQueryUri: "",
      abi: strategyOpAbi
    }
  ],
} as const satisfies TransmutersMetadata;

export const TRANSMUTERS = {
  [mainnet.id]: [
    //DAI
    {
      address: "0xA840C73a004026710471F727252a9a2800a5197F",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Zosimos",
      aprQueryUri: "3890313",
    },
    //USDC
    {
      address: "0x49930AD9eBbbc0EB120CCF1a318c3aE5Bb24Df55",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Ge Hong",
      aprQueryUri: "3861243",
    },
    //USDT
    {
      address: "0xfC30820ba6d045b95D13a5B8dF4fB0E6B5bdF5b9",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Paracelsus",
      aprQueryUri: "4026456",
    },
    //FRAX
    {
      address: "0xE107Fa35D775C77924926C0292a9ec1FC14262b2",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Flamel",
      aprQueryUri: "3989525",
    },
    //WETH
    {
      address: "0x03323143a5f0D0679026C2a9fB6b0391e4D64811",
      synthAsset: SYNTH_ASSETS.ALETH,
      label: "Van Helmont",
      aprQueryUri: "3849355",
    },
  ],
  [fantom.id]: [
    //DAI
    {
      address: "0x486FCC9385dCd16fE9ac21a959B072dcB58912e0",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Zosimos",
      aprQueryUri: "",
    },
    //USDC
    {
      address: "0xaE653176d1AF6A68B5ce57481427a065E1baC49f",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Ge Hong",
      aprQueryUri: "",
    },
    //USDT
    {
      address: "0x53F05426D48E667c6a131F17db1b6f7AC535aBC6",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Paracelsus",
      aprQueryUri: "",
    },
  ],
  [optimism.id]: [
    //DAI
    {
      address: "0xFCD619923456E20EAe298B35E3606277b391BBB4",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Zosimos",
      aprQueryUri: "4026735",
    },
    //USDC
    {
      address: "0xA7ea9ef9E2b5e15971040230F5d6b75C68Aab723",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Ge Hong",
      aprQueryUri: "4037405",
    },
    //USDT
    {
      address: "0x4e7d2115E4FeEcD802c96E77B8e03D98104415fa",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Paracelsus",
      aprQueryUri: "",
    },
    //ETH
    {
      address: "0xb7C4250f83289ff3Ea9f21f01AAd0b02fb19491a",
      synthAsset: SYNTH_ASSETS.ALETH,
      label: "Van Helmont",
      aprQueryUri: "3862748",
    },
  ],
  [arbitrum.id]: [
    //DAI
    {
      address: "0xD6a5577c2f6200591Fe077E45861B24AeeB408e9",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Zosimos",
      aprQueryUri: "",
    },
    //USDC
    {
      address: "0xe7ec71B894583E9C1b07873fA86A7e81f3940eA8",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Ge Hong",
      aprQueryUri: "3947029",
    },
    //USDT
    {
      address: "0x2a8B5F365Fb29C3E1a40a5cd14AD7f89050755Ed",
      synthAsset: SYNTH_ASSETS.ALUSD,
      label: "Paracelsus",
      aprQueryUri: "",
    },
    //ETH
    {
      address: "0x1EB7D78d7f6D73e5de67Fa62Fd8b55c54Aa9c0D4",
      synthAsset: SYNTH_ASSETS.ALETH,
      label: "Van Helmont",
      aprQueryUri: "3888361",
    },
  ],
} as const satisfies TransmutersMetadata;
