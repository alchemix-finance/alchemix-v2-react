import { arbitrum, fantom, mainnet, optimism } from "viem/chains";

export const STAKING_POOL_ADDRESSES = {
  [mainnet.id]: "0xAB8e74017a8Cc7c15FFcCd726603790d26d7DeCa",
} as const;

export const SUSHI = {
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

export const CURVE = {
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

export const INTERNAL_FARMS_METADATA = [
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

export const STATIC_EXTERNAL_FARMS = {
  [mainnet.id]: [
    {
      icon: "balancer.svg",
      collabicon: "aura.webp",
      name: "AURA x Balancer",
      symbol: "ALCX-WETH",
      subtitle:
        "Deposit liquidity on Balancer, and then stake your received BPT to earn AURA in addition to Balancer's native rewards",
      actions: [
        {
          label: "Deposit",
          url: "https://balancer.fi/pools/ethereum/v2/0xf16aee6a71af1a9bc8f56975a4c2705ca7a782bc0002000000000000000004bb/add-liquidity",
        },
        {
          label: "Stake",
          url: "https://app.aura.finance/#/1/pool/74",
        },
      ],
    },
    {
      icon: "crv.svg",
      collabicon: "convex.svg",
      name: "Curve x Convex",
      symbol: "alUSD-3CRV",
      subtitle:
        "Deposit and stake alUSD and 3CRV to earn CRV and CVX in addition to Curve's native rewards.",
      actions: [
        {
          label: "Deposit",
          url: "https://curve.fi/#/ethereum/pools/alusd/deposit",
        },
        {
          label: "Stake",
          url: "https://curve.convexfinance.com/stake",
        },
      ],
    },
    {
      icon: "crv.svg",
      collabicon: "convex.svg",
      name: "Curve x Convex",
      symbol: "alUSD-FRAXBP",
      subtitle:
        "Deposit and stake alUSD and FRAXBP to earn CRV and CVX in addition to Curve's native rewards.",
      actions: [
        {
          label: "Deposit",
          url: "https://curve.fi/#/ethereum/pools/factory-v2-147/deposit",
        },
        {
          label: "Stake",
          url: "https://curve.convexfinance.com/stake",
        },
      ],
    },
    {
      icon: "crv.svg",
      collabicon: "convex.svg",
      name: "Curve x Convex",
      symbol: "alETH-WETH",
      subtitle:
        "Deposit and stake alETH and WETH to earn CRV and CVX in addition to Curve's native rewards.",
      actions: [
        {
          label: "Deposit",
          url: "https://curve.fi/#/ethereum/pools/factory-stable-ng-36/deposit",
        },
        {
          label: "Stake",
          url: "https://curve.convexfinance.com/stake",
        },
      ],
    },
    {
      icon: "crv.svg",
      collabicon: "convex.svg",
      name: "Curve x Convex",
      symbol: "alETH-frxETH",
      subtitle:
        "Deposit and stake alETH and frxETH to earn CRV and CVX in addition to Curve's native rewards.",
      actions: [
        {
          label: "Deposit",
          url: "https://curve.fi/#/ethereum/pools/factory-v2-253/deposit",
        },
        {
          label: "Stake",
          url: "https://curve.convexfinance.com/stake",
        },
      ],
    },
    {
      icon: "crv.svg",
      collabicon: "convex.svg",
      name: "Curve x Convex",
      symbol: "ALCX-FRAXBP",
      subtitle:
        "Deposit and stake ALCX and FRAXBP to earn CRV and CVX in addition to Curve's native rewards.",
      actions: [
        {
          label: "Deposit",
          url: "https://curve.fi/#/ethereum/pools/factory-crypto-96/deposit",
        },
        {
          label: "Stake",
          url: "https://curve.convexfinance.com/stake",
        },
      ],
    },
  ],
  [optimism.id]: [
    {
      symbol: "alUSD-USDC",
      icon: "velodrome.svg",
      collabicon: "",
      name: "Velodrome",
      actions: [
        {
          label: "Manage",
          url: "https://velo.drome.eth.limo/deposit?token0=0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85&token1=0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A&type=0",
        },
      ],
    },
    {
      symbol: "alUSD-FRAX",
      icon: "velodrome.svg",
      collabicon: "",
      name: "Velodrome",
      actions: [
        {
          label: "Manage",
          url: "https://velo.drome.eth.limo/deposit?token0=0x2E3D870790dC77A83DD1d18184Acc7439A53f475&token1=0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A&type=0",
        },
      ],
    },
    {
      symbol: "alUSD-DOLA",
      icon: "velodrome.svg",
      collabicon: "",
      name: "Velodrome",
      actions: [
        {
          label: "Manage",
          url: "https://velo.drome.eth.limo/deposit?token0=0x8aE125E8653821E851F12A49F7765db9a9ce7384&token1=0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A&type=0",
        },
      ],
    },
    {
      symbol: "alUSD-OP",
      icon: "velodrome.svg",
      collabicon: "",
      name: "Velodrome",
      actions: [
        {
          label: "Manage",
          url: "https://velo.drome.eth.limo/deposit?token0=0x4200000000000000000000000000000000000042&token1=0xCB8FA9a76b8e203D8C3797bF438d8FB81Ea3326A&type=-1",
        },
      ],
    },
    {
      symbol: "alETH-WETH",
      icon: "velodrome.svg",
      collabicon: "",
      name: "Velodrome",
      actions: [
        {
          label: "Manage",
          url: "https://velo.drome.eth.limo/deposit?token0=0x3E29D3A9316dAB217754d13b28646B76607c5f04&token1=0x4200000000000000000000000000000000000006&type=0",
        },
      ],
    },
    {
      symbol: "alETH-frxETH",
      icon: "velodrome.svg",
      collabicon: "",
      name: "Velodrome",
      actions: [
        {
          label: "Manage",
          url: "https://velo.drome.eth.limo/deposit?token0=0x3E29D3A9316dAB217754d13b28646B76607c5f04&token1=0x6806411765Af15Bddd26f8f544A34cC40cb9838B&type=0",
        },
      ],
    },
    {
      symbol: "alETH-pxETH",
      icon: "velodrome.svg",
      collabicon: "",
      name: "Velodrome",
      actions: [
        {
          label: "Manage",
          url: "https://velo.drome.eth.limo/deposit?token0=0x300d2c875C6fb8Ce4bf5480B4d34b7c9ea8a33A4&token1=0x3E29D3A9316dAB217754d13b28646B76607c5f04&type=0&factory=0xF1046053aa5682b4F9a81b5481394DA16BE5FF5a&chain=10",
        },
      ],
    },
    {
      symbol: "alETH-OP",
      icon: "velodrome.svg",
      collabicon: "",
      name: "Velodrome",
      actions: [
        {
          label: "Manage",
          url: "https://velo.drome.eth.limo/deposit?token0=0x3E29D3A9316dAB217754d13b28646B76607c5f04&token1=0x4200000000000000000000000000000000000042&type=-1",
        },
      ],
    },
  ],
  [arbitrum.id]: [
    {
      symbol: "alUSD-FRAX",
      icon: "ramses.svg",
      collabicon: "",
      name: "Ramses",
      actions: [
        {
          label: "Manage",
          url: "https://app.ramses.exchange/manage/v1/0xfd599db360cd9713657c95df66650a427d213010",
        },
      ],
    },
    {
      symbol: "alUSD-GRAI",
      icon: "ramses.svg",
      collabicon: "",
      name: "Ramses",
      actions: [
        {
          label: "Manage",
          url: "https://app.ramses.exchange/single-stake?vaultAddress=0x7d41fbe50ed131816e87c4d7340424740882f709",
        },
      ],
    },
    {
      symbol: "alUSD-alETH",
      icon: "ramses.svg",
      collabicon: "",
      name: "Ramses",
      actions: [
        {
          label: "Manage",
          url: "https://app.ramses.exchange/liquidity/v2/0xb69d60d0690733c0cc4db1c1aedeeaa308f30328",
        },
      ],
    },
    {
      symbol: "alETH-frxETH",
      icon: "ramses.svg",
      collabicon: "",
      name: "Ramses",
      actions: [
        {
          label: "Manage",
          url: "https://app.ramses.exchange/manage/v1/0xfb4fe921f724f3c7b610a826c827f9f6ecef6886",
        },
      ],
    },
    {
      symbol: "alETH-ALCX",
      icon: "ramses.svg",
      collabicon: "",
      name: "Ramses",
      actions: [
        {
          label: "Manage",
          url: "https://app.ramses.exchange/manage/v1/0x9c99764ad164360cf85eda42fa2f4166b6cba2a4",
        },
      ],
    },
    {
      symbol: "alETH-GRAI",
      icon: "ramses.svg",
      collabicon: "",
      name: "Ramses",
      actions: [
        {
          label: "Manage",
          url: "https://app.ramses.exchange/single-stake?vaultAddress=0xf9e36cf8d3f64692919061011c0d28f6f55a795b",
        },
      ],
    },
  ],
  [fantom.id]: [],
} as const;
