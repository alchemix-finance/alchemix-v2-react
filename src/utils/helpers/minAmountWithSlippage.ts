import { MAX_UINT256_BN } from "@/lib/constants";

/**
 * Calculate the minimum out for a given amount with slippage
 * @param amount - the amount to calculate the minimum out for with slippage
 * @param slippage - the slippage to apply to the amount. Slippage is in basis points (10000 = 100%)
 * @returns the minimum amount out after applying slippage
 */
export const calculateMinimumOut = (
  amount: bigint | undefined,
  slippage: bigint,
) => {
  if (!amount) return MAX_UINT256_BN;
  const bps = 10000n;
  return amount - (amount * slippage) / bps;
};
