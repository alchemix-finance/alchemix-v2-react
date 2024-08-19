import { useReadContract } from "wagmi";

import { staticTokenAdapterAbi } from "@/abi/staticTokenAdapter";
import { useChain } from "./useChain";
import { formatUnits, parseUnits } from "viem";
import { Token, Vault } from "@/lib/types";
import { isInputZero } from "@/utils/inputNotZero";

interface UseStaticTokenAdapterWithdrawAmountArgs {
  typeGuard: "withdrawInput";

  balanceForYieldToken: string | undefined;
  isSelectedTokenYieldToken: boolean;
  vault: Vault;

  amount?: never;
  selectedToken?: never;
}

interface UseStaticTokenAdapterAdjustedAmountArgs {
  typeGuard: "adjustedAmount";

  amount: string;
  selectedToken: Token;
  vault: Vault;
  isSelectedTokenYieldToken: boolean;

  balanceForYieldToken?: never;
}

type UseStaticTokenAdapterWithdrawArgs =
  | UseStaticTokenAdapterWithdrawAmountArgs
  | UseStaticTokenAdapterAdjustedAmountArgs;

/**
 * Adjusted for Aave static token adapter.
 * Aim is to get the exact amount of yield token user wants to withdraw.
 * We use it in withdraw input to adjust available balance to dynamic aave yield tokens.
 * We use it in useWithdraw to adjust amount back to static amount for static token adapter.
 * @dev It is safe to assume that static adapter has same decimals as yield token (it inherits from it).
 */
export const useStaticTokenAdapterWithdraw = ({
  typeGuard,
  balanceForYieldToken,
  isSelectedTokenYieldToken,
  vault,
  amount,
  selectedToken,
}: UseStaticTokenAdapterWithdrawArgs) => {
  const chain = useChain();

  const { data: balanceForYieldTokenAdapter } = useReadContract({
    address: vault.yieldToken,
    chainId: chain.id,
    abi: staticTokenAdapterAbi,
    functionName: "staticToDynamicAmount",
    args: [
      parseUnits(balanceForYieldToken ?? "0", vault.yieldTokenParams.decimals),
    ],
    query: {
      enabled:
        vault.metadata.api.provider === "aave" &&
        typeGuard === "withdrawInput" &&
        balanceForYieldToken !== undefined &&
        isSelectedTokenYieldToken &&
        !!vault.metadata.yieldTokenOverride,
      select: (balance) =>
        formatUnits(balance, vault.yieldTokenParams.decimals),
    },
  });

  const { data: aaveAdjustedAmount } = useReadContract({
    address: vault.yieldToken,
    abi: staticTokenAdapterAbi,
    functionName: "dynamicToStaticAmount",
    args: [
      typeGuard === "adjustedAmount"
        ? parseUnits(amount, selectedToken.decimals)
        : 0n,
    ],
    query: {
      enabled:
        vault.metadata.api.provider === "aave" &&
        typeGuard === "adjustedAmount" &&
        !isInputZero(amount) &&
        isSelectedTokenYieldToken &&
        !!vault.metadata.yieldTokenOverride,
    },
  });

  return { balanceForYieldTokenAdapter, aaveAdjustedAmount };
};
