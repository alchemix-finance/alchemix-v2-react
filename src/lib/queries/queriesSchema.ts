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
  Apr: "apr",
  Migration: (v: string) => `migrate-${v}`,
  VotesForAddress: "votesForAddress",
} as const;

// TODO: We can split alchemists, vaults, tokens, transmuters etc into separate queries
// With that we can fetch all using useQueries and invalidate exact instances when mutation happens.
