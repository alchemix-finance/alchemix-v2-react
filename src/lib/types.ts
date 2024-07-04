import { Address } from "viem";
import { useVaults } from "./queries/useVaults";
import { useTransmuters } from "./queries/useTransmuters";

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

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
