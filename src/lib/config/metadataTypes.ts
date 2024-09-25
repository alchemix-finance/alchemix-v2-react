import { Address } from "viem";
import { SYNTH_ASSETS, SynthAsset } from "./synths";
import { SupportedChainId, wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import React from "react";
import { Token, Vault } from "@/lib/types";
import { UsePublicClientReturnType } from "wagmi";

export interface TransmuterMetadata {
  address: Address;
  label: string;
  synthAsset: SynthAsset;
  aprQueryUri: string;
}

export type TransmutersMetadata = {
  [chainId in SupportedChainId]: TransmuterMetadata[];
};

export type AlchemistsMetadata = {
  [chainId in SupportedChainId]: {
    [key in (typeof SYNTH_ASSETS)[keyof typeof SYNTH_ASSETS]]: Address;
  };
};

export interface ConnextConfiguration {
  connextId: number;
  gatewayAddress?: string;
}

export interface ChainToken {
  symbol: string;
  name: string;
  decimals: number;
}

export interface SynthAssetMetadata {
  [key: string]: {
    label: string;
    icon: string;
  };
}

export type MessageType = "info" | "warning" | "error";
export type VaultMessage = {
  message: string;
  type: MessageType;
  learnMoreUrl?: string;
};

type ApiProvider =
  | "meltedRewards"
  | "aave"
  | "yearn"
  | "frax"
  | "rocket"
  | "vesper"
  | "lido"
  | "gearbox"
  | "jones";

export interface VaultMetadata {
  label: string;
  image: string;
  synthAssetType: SynthAsset;
  underlyingSymbol: string;
  yieldSymbol: string;
  messages: VaultMessage[];
  api: {
    apr: AprFn;
    yieldType: string;
    provider: ApiProvider;
    bonus: BonusFn;
  };
  disabledDepositTokens: Address[];
  wethGateway?: Address;
  gateway?: Address;
  /**
   * This is the address of the actual yield (bearing for aave) token,
   * the regular yield token address in this case becomes a (static token adapter for aave or staking token for yearn),
   * that we use for the vaults.
   * If it exists, means the vault is using (static token adapter for aave or staking token for yearn).
   */
  yieldTokenOverride?: Address;
  strategy?: string;
  beta?: boolean;
}

/**
 * Handle fetching APR data
 */

interface AprFnParams {
  underlyingToken: Address;
  vaultAddress: Address;
  yieldTokenOverride: Address | undefined;
  chainId: SupportedChainId;
}
export type AprFn = (params: AprFnParams) => Promise<number>;

interface BonusFnParams {
  vault: Vault;
  chainId: SupportedChainId;
  tokens: Token[] | undefined;
  publicClient: UsePublicClientReturnType<typeof wagmiConfig>;
}
interface BonusData {
  hasBonus: boolean;
  bonusTimeLimit: boolean;
  distributionTimeAmount: string;
  distributionTimeUnit: string;
  bonusYieldRate: number;
  bonusYieldTokenSymbol: string;
}
export type BonusFn = (params: BonusFnParams) => Promise<BonusData>;

export interface FarmMetadata {
  title: string;
  subtitle: string;
  farmIcon: string;
  tokenIcon: string;
  //   adapter: BaseFarmAdapterFn;
  isDisabled?: boolean;
  poolId?: number;
  addresses?: {
    [key: string]: Address;
  };
  component?: React.ReactNode;
}

export interface MigrationParams {
  balancerPoolToken: `0x${string}`;
  auraPool: `0x${string}`;
  poolTokensIn: bigint;
  amountCompanionMinimumOut: bigint;
  amountWETHMinimumOut: bigint;
  wethRequired: bigint;
  minAmountTokenOut: bigint;
  amountBalancerLiquidityOut: bigint;
  amountAuraSharesMinimum: bigint;
  stake: boolean;
}
