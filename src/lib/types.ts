import { Address } from "viem";
import { useVaults } from "./queries/vaults/useVaults";
import { useTransmuters } from "@/lib/queries/transmuters/useTransmuters";
import { useProposals } from "./queries/useProposals";

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type SupportedCurrency = "USD" | "ETH";

export type TokenAdapter = {
  price: bigint;
  underlyingToken: Address;
  token: Address;
  version: string;
};

export interface Token {
  address: Address;
  decimals: number;
  logoURI?: string;
  name?: string;
  symbol: string;
}

export interface YieldTokenParams {
  accruedWeight: bigint;
  activeBalance: bigint;
  adapter: Address;
  creditUnlockRate: bigint;
  decimals: number;
  distributedCredit: bigint;
  enabled: boolean;
  expectedValue: bigint;
  harvestableBalance: bigint;
  lastDistributionBlock: bigint;
  maximumExpectedValue: bigint;
  maximumLoss: bigint;
  pendingCredit: bigint;
  totalShares: bigint;
  underlyingToken: Address;
}

export interface UnderlyingTokensParams {
  decimals: number;
  // A coefficient used to normalize the token to a value comparable to the debt token. For example, if the
  // underlying token is 8 decimals and the debt token is 18 decimals then the conversion factor will be
  // 10^10. One unit of the underlying token will be comparably equal to one unit of the debt token.
  conversionFactor: bigint;
  // A flag to indicate if the token is enabled.
  enabled: boolean;
}

export type Vault = NonNullable<ReturnType<typeof useVaults>["data"]>[number];
export type Transmuter = NonNullable<
  ReturnType<typeof useTransmuters>["data"]
>[number];
export type Proposal = NonNullable<
  ReturnType<typeof useProposals>["data"]
>[number];

interface BaseFarm {
  uuid: string;
  poolTokenAddress: `0x${string}`;
  poolTokenBalance: string;
  tokenSymbol: string;
  isActive: boolean;
  poolId: number;
  metadata: {
    tokenIcon: string | undefined;
    farmIcon: string;
    title: string;
    subtitle: string;
    type: "internal" | "external-sushi" | "external-curve";
  };
  staked: {
    amount: string;
    tokenSymbol: string;
  };
  rewards: {
    iconName: string;
    tokenName: string;
    tokenAddress: `0x${string}`;
    symbol: string;
    amount: string;
  }[];
  yield: {
    rate: string;
    type: "APY";
  };
}
interface InternalFarm extends BaseFarm {
  type: "internal";
  reserve: string;
}
interface CurveFarm extends BaseFarm {
  type: "external-curve";
  tvl: string;
  metapoolAddress: `0x${string}`;
}
interface SushiFarm extends BaseFarm {
  type: "external-sushi";
  underlyingAddresses: [`0x${string}`, `0x${string}`];
  reserves: [string, string];
  tvl: string;
  masterChefAddress: `0x${string}`;
}
export type Farm = InternalFarm | SushiFarm | CurveFarm;

// Airdrop types
export interface MerkleDistributorArtifacts {
  token: string;
  decimals: number;
  merkleRoot: string;
  total: string;
  claims: Record<string, Claim>;
}

export interface Claim {
  index: number;
  amount: string;
  proof: string[];
}

export interface DeploymentAddresses {
  chainId: number;
  distributor: string;
}
