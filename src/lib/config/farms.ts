import { mainnet } from "viem/chains";

export const stakingPoolsAddresses = {
  [mainnet.id]: "0xAB8e74017a8Cc7c15FFcCd726603790d26d7DeCa",
} as const;

export const sushi = {
  pool: "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8",
  masterchef: "0xEF0881eC094552b2e128Cf945EF17a6752B4Ec5d",
  onsenRewarder: "0x7519C93fC5073E15d89131fD38118D73A72370F8",
  metadata: {
    type: "external-sushi",
    title: "ALCX/ETH v2",
    subtitle: "SushiSwap LP",
    farmIcon: "alchemix.svg",
    tokenIcon: "sushi",
  },
} as const;

export const curve = {
  gauge: "0x9582C4ADACB3BCE56Fea3e590F05c3ca2fb9C477",
  metapool: "0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c",
  rewards: "0xb76256d1091e93976c61449d6e500d9f46d827d4",
  metadata: {
    type: "external-curve",
    title: "alUSD3CRV v2",
    subtitle: "Curve alUSD Metapool",
    farmIcon: "alusd_med.svg",
    tokenIcon: "crv",
  },
} as const;

export const internalFarmsMetadata = [
  {
    type: "internal",
    address: "0xbc6da0fe9ad5f3b0d58160288917aa56653660e9",
    title: "alUSD",
    subtitle: "Alchemix alUSD",
    farmIcon: "alusd_med.svg",
    tokenIcon: undefined,
  },
  {
    type: "internal",
    address: "0xdbdb4d16eda451d0503b854cf79d55697f90c8df",
    title: "ALCX",
    subtitle: "Alchemix ALCX",
    farmIcon: "alchemix.svg",
    tokenIcon: undefined,
  },
  {
    type: "internal",
    address: "0xc3f279090a47e80990fe3a9c30d24cb117ef91a8",
    title: "ALCX/ETH v1",
    subtitle: "SushiSwap LP",
    farmIcon: "alchemix.svg",
    tokenIcon: "sushi",
  },
  {
    type: "internal",
    address: "0x43b4fdfd4ff969587185cdb6f0bd875c5fc83f8c",
    title: "alUSD3CRV",
    subtitle: "Curve alUSD Metapool",
    farmIcon: "alusd_med.svg",
    tokenIcon: "crv",
  },
  {
    type: "internal",
    address: "0xc9da65931abf0ed1b74ce5ad8c041c4220940368",
    title: "Saddle alETH",
    subtitle: "Saddle LP",
    farmIcon: "alchemix.svg",
    tokenIcon: "saddle",
  },
  {
    type: "internal",
    address: "0xc4c319e2d4d66cca4464c0c2b32c9bd23ebe784e",
    title: "alETH Curve",
    subtitle: "Curve alETH Metapool",
    farmIcon: "alusd_med.svg",
    tokenIcon: "crv",
  },
  {
    type: "internal",
    address: "0xd3b5d9a561c293fb42b446fe7e237daa9bf9aa84",
    title: "tALCX",
    subtitle: "Alchemix tALCX",
    farmIcon: "alchemix.svg",
    tokenIcon: "tokemak",
  },
] as const;

export const staticExternalFarms = [
  {
    icon: "saddle.svg",
    name: "Saddle d4",
    subtitle:
      "Deposit alUSD, FEI, FRAX, and/or LUSD to earn ALCX, TRIBE, FXS and LQTY",
    actions: [
      {
        label: "Deposit",
        url: "https://saddle.exchange/#/pools/d4/deposit",
      },
      {
        label: "Stake",
        url: "https://app.frax.finance/staking#Saddle_alUSD_FEI_FRAX_LUSD",
      },
      {
        label: "Swap",
        url: "https://saddle.exchange/#/",
      },
    ],
  },
  {
    icon: "sushi.svg",
    name: "alUSD/ETH Onsen",
    subtitle: "Deposit alUSD and ETH on Sushiswap to earn SUSHI",
    actions: [
      {
        label: "Deposit",
        url: "https://app.sushi.com/add/ETH/0xBC6DA0FE9aD5f3b0d58160288917AA56653660E9",
      },
      {
        label: "Stake",
        url: "https://app.sushi.com/farm",
      },
      {
        label: "Swap",
        url: "https://app.sushi.com/swap#/swap?inputCurrency=0xbc6da0fe9ad5f3b0d58160288917aa56653660e9&outputCurrency=0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      },
    ],
  },
  {
    icon: "mstable.svg",
    name: "mStable alUSD Feeder",
    subtitle: "Deposit alUSD to earn MTA",
    actions: [
      {
        label: "Deposit & Stake",
        url: "https://mstable.app/#/musd/pools/0x4eaa01974b6594c0ee62ffd7fee56cf11e6af936",
      },
      {
        label: "Swap",
        url: "https://mstable.app/#/musd/swap",
      },
    ],
  },
] as const;
