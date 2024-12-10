/**
 * @name QueriesSchema
 * @description This is the schema for the queries used in the app.
 * We can use this for consistent query invalidation.
 */
export const QueryKeys = {
  Alchemists: "achemists",
  Vaults: "vaults",
  Bonus: "bonus",
  Tokens: "tokens",
  Proposals: "proposals",
  ActiveProposals: "activeProposals",
  Delegate: "delegate",
  TokenPrice: "tokenPrice",
  Transmuters: "transmuters",
  TransmuterApr: "transmuter-apr",
  Apr: "apr",
  Migration: (v: string) => `migrate-${v}`,
  VotesForAddress: "votesForAddress",
  Farms: (type: "internal" | "sushi" | "curve") => `farms-${type}`,
  ConnextSdk: (
    type:
      | "relayerFee"
      | "amountOut"
      | "approval"
      | "originTxSubgraph"
      | "destinationTxSubgraph",
  ) => `connextSdk-${type}`,
  HarvestsAndBonuses: "harvests-and-bonuses",
  HistoricYield: "historicYield",
  GeneratedEarned: "generatedEarned",
} as const;

/**
 * @name ScopeKeys
 * @description This is the schema for wagmi hooks queries scope keys.
 * @dev Wagmi will set `scopeKey` field of the params object (queryKey[1]) of the query key.
 * We use this for watching the queries.
 * This is a workaround because wagmi returns unstable query keys.
 */
export const ScopeKeys = {
  TokenInput: "token-input",
  BorrowInput: "borrow-input",
  LiquidateInput: "liquidate-input",
  MigrateInput: "migrate-input",
  RepayInput: "repay-input",
  TransmuterInput: "transmuter-input",
  VaultWithdrawInput: "vault-withdraw-input",
  DebtSelection: "debt-selection",
  FarmContent: "farm-content",
  CurveFarmContent: "curve-farm-content",
  SushiFarmContent: "sushi-farm-content",
  InternalFarmContent: "internal-farm-content",
} as const;
export type ScopeKey = (typeof ScopeKeys)[keyof typeof ScopeKeys];

// TODO: We can split alchemists, vaults, tokens, transmuters etc into separate queries
// With that we can fetch all using useQueries and invalidate exact instances when mutation happens.
