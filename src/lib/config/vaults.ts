import { zeroAddress } from "viem";
import { arbitrum, fantom, mainnet, optimism } from "viem/chains";

import { GAS_ADDRESS, WETH_MAINNET_ADDRESS } from "@/lib/constants";

import { SYNTH_ASSETS } from "@/lib/config/synths";
import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";
import { VaultMetadata } from "@/lib/config/metadataTypes";
import { getYearnApy } from "@/lib/middleware/yearn";
import { getAaveApr } from "@/lib/middleware/aave";
import { getVesperApr } from "@/lib/middleware/vesper";
import { getRocketApr } from "@/lib/middleware/rocketPool";
import { getLidoApy } from "@/lib/middleware/lido";
import { getFraxApy } from "@/lib/middleware/frax";
import {
  getAaveBonusData,
  getMeltedRewardsBonusData,
  getNoBonus,
  getVesperBonusData,
} from "@/lib/middleware/bonuses";
import { getGearboxApy } from "@/lib/middleware/gearbox";
import { getJonesApy } from "@/lib/middleware/jones";

// @dev some vaults are broken so we need to ignore them from processing
export const IGNORED_VAULTS: `0x${string}`[] = [
  "0x59417c1b2085e086f1EEB1AF0F40eE1dFD9c097f",
  "0xf350C6B7fbe5F6CB53c7D638Dfba9173A5722236",
  "0xC5c0D3e20DF4CA855281B4b5Bcf3bEf8D8068c75",
  "0x400509D00888c46903CF01495BB2eeAfD24F0f80",
  "0x27423e4A9fD2E5860a1b87395503Ca115f231AB6",
  "0x082B50BeC5E85D82b52264dA7Ad24187a235DBC4",
  "0x1d2bE809EE3a0eeACb02d3d234b3eD479e1c4962",
  "0xDC8Eb117A9987cF2ED45E9082Adc13C03922Fa0a",
];

export type VaultsConfig = {
  [chainId in SupportedChainId]: {
    [yieldToken: `0x${string}`]: VaultMetadata;
  };
};

export const VAULTS: VaultsConfig = {
  [mainnet.id]: {
    //alUSD
    "0xdA816459F1AB5631232FE5e97a05BBBb94970c95": {
      label: "Yearn yvDAI",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "DAI",
      yieldSymbol: "yvDAI",
      image: "yvDAI.svg",
      messages: [],
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "yearn",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE": {
      label: "Yearn yvUSDC",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDC",
      yieldSymbol: "yvUSDC",
      image: "yvUSDC.svg",
      messages: [],
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "yearn",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0x7Da96a3891Add058AdA2E826306D812C638D87a7": {
      label: "Yearn yvUSDT",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDT",
      yieldSymbol: "yvUSDT",
      image: "yvUSDT.svg",
      messages: [{ message: "Vault is disabled.", type: "warning" }],
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "yearn",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0xcE4a49d7ed99C7c8746B713EE2f0C9aA631688d8": {
      label: "AAVE aDAI",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "DAI",
      yieldSymbol: "aDAI",
      image: "aDAI.svg",
      messages: [],
      yieldTokenOverride: "0x028171bCA77440897B824Ca71D1c56caC55b68A3",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getAaveBonusData,
      },
      disabledDepositTokens: [],
    },
    "0xf591D878608e2e5c7D4f1E499330f4AB9BbaE37a": {
      label: "AAVE aUSDC",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDC",
      yieldSymbol: "aUSDC",
      image: "aUSDC.svg",
      messages: [],
      yieldTokenOverride: "0xBcca60bB61934080951369a648Fb03DF4F96263C",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getAaveBonusData,
      },
      disabledDepositTokens: [],
    },
    "0xBC11De1F20e83F0a6889B8c7A7868E722694E315": {
      label: "AAVE aUSDT",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDT",
      yieldSymbol: "aUSDT",
      image: "aUSDT.svg",
      messages: [],
      yieldTokenOverride: "0x3Ed3B47Dd13EC9a98b44e6204A523E766B225811",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getAaveBonusData,
      },
      disabledDepositTokens: [],
    },
    "0x3B27F92C0e212C671EA351827EDF93DB27cc0c65": {
      label: "Yearn yvUSDT",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDT",
      yieldSymbol: "yvUSDT",
      image: "yvUSDT.svg",
      messages: [],
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "yearn",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0xa8b607Aa09B6A2E306F93e74c282Fb13f6A80452": {
      label: "Vesper vaUSDC",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDC",
      yieldSymbol: "vaUSDC",
      image: "vaUSDC.svg",
      messages: [],
      api: {
        apr: getVesperApr,
        yieldType: "APR",
        provider: "vesper",
        bonus: getVesperBonusData,
      },
      disabledDepositTokens: [],
    },
    "0x0538C8bAc84E95A9dF8aC10Aad17DbE81b9E36ee": {
      label: "Vesper vaDAI",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "DAI",
      yieldSymbol: "vaDAI",
      image: "vaDAI.svg",
      messages: [],
      api: {
        apr: getVesperApr,
        yieldType: "APR",
        provider: "vesper",
        bonus: getVesperBonusData,
      },
      disabledDepositTokens: [],
    },
    "0xc14900dFB1Aa54e7674e1eCf9ce02b3b35157ba5": {
      label: "Vesper vaFRAX",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "FRAX",
      yieldSymbol: "vaFRAX",
      image: "vaFRAX.svg",
      messages: [],
      api: {
        apr: getVesperApr,
        yieldType: "APR",
        provider: "vesper",
        bonus: getVesperBonusData,
      },
      disabledDepositTokens: [],
    },
    "0x318334A6dD21d16A8442aB0b7204E81Aa3FB416E": {
      label: "Aave aFRAX",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "FRAX",
      yieldSymbol: "aFRAX",
      image: "aFRAX.svg",
      messages: [],
      yieldTokenOverride: "0xd4937682df3C8aEF4FE912A96A74121C0829E664",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getAaveBonusData,
      },
      disabledDepositTokens: [],
    },
    //alETH
    "0xa258C4606Ca8206D8aA700cE2143D7db854D168c": {
      label: "Yearn yvWETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "yvWETH",
      image: "yvWETH.svg",
      messages: [],
      wethGateway: "0xA22a7ec2d82A471B1DAcC4B37345Cf428E76D67A",
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "yearn",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0": {
      label: "Lido wstETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "wstETH",
      image: "wstETH.svg",
      messages: [],
      wethGateway: "0xA22a7ec2d82A471B1DAcC4B37345Cf428E76D67A",
      gateway: "0xA22a7ec2d82A471B1DAcC4B37345Cf428E76D67A",
      api: {
        apr: getLidoApy,
        yieldType: "APR",
        provider: "lido",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0xae78736Cd615f374D3085123A210448E74Fc6393": {
      label: "Rocket rETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "rETH",
      image: "rETH.svg",
      messages: [],
      wethGateway: "0xA22a7ec2d82A471B1DAcC4B37345Cf428E76D67A",
      api: {
        apr: getRocketApr,
        yieldType: "APR",
        provider: "rocket",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [GAS_ADDRESS, WETH_MAINNET_ADDRESS],
    },
    "0x61134511187a9a2DF38D10DBe07Ba2e8E5563967": {
      label: "AAVE aWETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "aWETH",
      image: "aWETH.svg",
      messages: [],
      wethGateway: "0xA22a7ec2d82A471B1DAcC4B37345Cf428E76D67A",
      yieldTokenOverride: "0x030bA81f1c18d280636F32af80b9AAd02Cf0854e",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getAaveBonusData,
      },
      disabledDepositTokens: [],
    },
    "0xd1C117319B3595fbc39b471AB1fd485629eb05F2": {
      label: "Vesper vaETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "vaETH",
      image: "vaETH.svg",
      messages: [],
      wethGateway: "0xA22a7ec2d82A471B1DAcC4B37345Cf428E76D67A",
      api: {
        apr: getVesperApr,
        yieldType: "APR",
        provider: "vesper",
        bonus: getVesperBonusData,
      },
      disabledDepositTokens: [],
    },
    "0xac3E018457B222d93114458476f3E3416Abbe38F": {
      label: "Frax sfrxETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "FRXETH",
      yieldSymbol: "sfrxETH",
      image: "sfrxETH.svg",
      messages: [],
      api: {
        apr: getFraxApy,
        yieldType: "APR",
        provider: "frax",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
  },
  [fantom.id]: {
    //alUSD
    "0x637eC617c86D24E421328e6CAEa1d92114892439": {
      label: "Yearn yDAI",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "DAI",
      yieldSymbol: "yDAI",
      image: "yDAI.svg",
      messages: [{ message: "Vault is disabled.", type: "warning" }],
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "yearn",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0xEF0210eB96c7EB36AF8ed1c20306462764935607": {
      label: "Yearn yUSDC",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDC",
      yieldSymbol: "yUSDC",
      image: "yUSDC.svg",
      messages: [{ message: "Vault is disabled.", type: "warning" }],
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "yearn",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0x148c05caf1Bb09B5670f00D511718f733C54bC4c": {
      label: "Yearn fUSDT",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDT",
      yieldSymbol: "fUSDT",
      image: "fUSDT.svg",
      messages: [{ message: "Vault is disabled.", type: "warning" }],
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "yearn",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
  },
  [optimism.id]: {
    //alUSD
    "0x43A502D7e947c8A2eBBaf7627E104Ddcc253aBc6": {
      label: "AAVE aDAI",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "DAI",
      yieldSymbol: "aDAI",
      image: "aDAI.svg",
      messages: [],
      gateway: "0x6076A6B474F336c566E4Ba551a5934E3ba5e7193",
      yieldTokenOverride: "0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },

    "0x4186Eb285b1efdf372AC5896a08C346c7E373cC4": {
      label: "AAVE aUSDC",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDC",
      yieldSymbol: "aUSDC",
      image: "aUSDC.svg",
      messages: [],
      gateway: "0x6076A6B474F336c566E4Ba551a5934E3ba5e7193",
      yieldTokenOverride: "0x625E7708f30cA75bfd92586e17077590C60eb4cD",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getMeltedRewardsBonusData,
      },
      disabledDepositTokens: [],
    },
    "0x2680b58945A31602E4B6122C965c2849Eb76Dd3B": {
      label: "AAVE aUSDT",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDT",
      yieldSymbol: "aUSDT",
      image: "aUSDT.svg",
      messages: [],
      gateway: "0x6076A6B474F336c566E4Ba551a5934E3ba5e7193",
      yieldTokenOverride: "0x6ab707Aca953eDAeFBc4fD23bA73294241490620",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0x059Eaa296B18E0d954632c8242dDb4a271175EeD": {
      label: "Yearn yvUSDC",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDC",
      yieldSymbol: "yvUSDC",
      image: "yvUSDC.svg",
      messages: [
        {
          message:
            "Yearn yvUSDC is currently disabled for underlying token deposit and withdraw.",
          type: "warning",
          learnMoreUrl: "https://discord.com/invite/yearn",
        },
      ],
      gateway: "0xC02670867efac6D988F40878a5559a8D96002A56",
      yieldTokenOverride: "0xaD17A225074191d5c8a37B50FdA1AE278a2EE6A2",
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "meltedRewards",
        bonus: getMeltedRewardsBonusData,
      },
      disabledDepositTokens: [],
    },
    "0x0A86aDbF58424EE2e304b395aF0697E850730eCD": {
      label: "Yearn yvDAI",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "DAI",
      yieldSymbol: "yvDAI",
      image: "yvDAI.svg",
      messages: [
        {
          message:
            "Yearn yvDAI is currently disabled for underlying token deposit and withdraw.",
          type: "warning",
          learnMoreUrl: "https://discord.com/invite/yearn",
        },
      ],
      gateway: "0xC02670867efac6D988F40878a5559a8D96002A56",
      yieldTokenOverride: "0x65343F414FFD6c97b0f6add33d16F6845Ac22BAc",
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "yearn",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    //alETH
    "0x337B4B933d60F40CB57DD19AE834Af103F049810": {
      label: "AAVE aWETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "aWETH",
      image: "aWETH.svg",
      messages: [],
      wethGateway: "0xDB3fE4Da32c2A79654D98e5a41B22173a0AF3933",
      gateway: "0xBa3e8437a06397430036E23fF9153408a3203aFD",
      yieldTokenOverride: "0xe50fA9b3c56FfB159cB0FCA61F5c9D750e8128c8",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
    "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb": {
      label: "Lido wstETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "wstETH",
      image: "wstETH.svg",
      messages: [],
      wethGateway: "0xDB3fE4Da32c2A79654D98e5a41B22173a0AF3933",
      api: {
        apr: getLidoApy,
        yieldType: "APR",
        provider: "meltedRewards",
        bonus: getMeltedRewardsBonusData,
      },
      disabledDepositTokens: [],
    },
    "0xE62DDa84e579e6A37296bCFC74c97349D2C59ce3": {
      label: "Yearn yvWETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "yvWETH",
      image: "yvWETH.svg",
      messages: [
        {
          message:
            "Yearn yvWETH is currently disabled for underlying token deposit and withdraw.",
          type: "warning",
          learnMoreUrl: "https://discord.com/invite/yearn",
        },
      ],
      gateway: "0xedE36d3F423EF198abE82D2463E0a18bcF2d9397",
      yieldTokenOverride: "0x5B977577Eb8a480f63e11FC615D6753adB8652Ae",
      api: {
        apr: getYearnApy,
        yieldType: "APY",
        provider: "meltedRewards",
        bonus: getMeltedRewardsBonusData,
      },
      disabledDepositTokens: [],
    },
  },
  [arbitrum.id]: {
    //alUSD
    "0x248a431116c6f6FCD5Fe1097d16d0597E24100f5": {
      label: "AAVE aUSDC",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDC",
      yieldSymbol: "aUSDC",
      image: "aUSDC.svg",
      messages: [],
      gateway: "0x3e1ccc66c755Fdbc7fbf7D667aA843c062Daf304",
      yieldTokenOverride: "0x724dc807b04555b71ed48a6896b6F41593b8C637",
      api: {
        apr: getAaveApr,
        yieldType: "APR",
        provider: "aave",
        bonus: getMeltedRewardsBonusData,
      },
      disabledDepositTokens: [],
    },
    "0xB0BDE111812EAC913b392D80D51966eC977bE3A2": {
      label: "Jones jUSDC",
      synthAssetType: SYNTH_ASSETS.ALUSD,
      underlyingSymbol: "USDC",
      yieldSymbol: "jUSDC",
      image: "jUSDC.webp",
      messages: [],
      api: {
        apr: getJonesApy,
        yieldType: "APY",
        provider: "jones",
        bonus: getNoBonus,
      },
      disabledDepositTokens: ["0xaf88d065e77c8cC2239327C5EDb3A432268e5831"], // Jones have geo-blocking, so we disable deposit of USDC -> let folks go to Jones directly
    },
    //alETH
    "0x5979D7b546E38E414F7E9822514be443A4800529": {
      label: "Lido wstETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "wstETH",
      image: "wstETH.svg",
      messages: [],
      wethGateway: "0x7C679D851688072e23fE41d1753004eb11E98D8c",
      api: {
        apr: getLidoApy,
        yieldType: "APR",
        provider: "lido",
        bonus: getMeltedRewardsBonusData,
      },
      disabledDepositTokens: [],
    },
    "0xf3b7994e4dA53E04155057Fd61dc501599d57877": {
      label: "Gearbox WETH",
      synthAssetType: SYNTH_ASSETS.ALETH,
      underlyingSymbol: "WETH",
      yieldSymbol: "farmdWETHV3",
      image: "WETH.svg",
      messages: [],
      api: {
        apr: getGearboxApy,
        yieldType: "APY",
        provider: "gearbox",
        bonus: getNoBonus,
      },
      disabledDepositTokens: [],
    },
  },
};

export const MAX_LOSS_CHECKER_ADDRESSES = {
  [mainnet.id]: "0x29Cb761285C6DeD504526c77F25d1946F0D6e3D5",
  [optimism.id]: "0x6b30f76CecE9F92D27f0e9Ad78312E77709E74A5",
  [arbitrum.id]: "0x6b30f76CecE9F92D27f0e9Ad78312E77709E74A5",
  [fantom.id]: zeroAddress,
} as const;
