import { UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import { formatEther, formatUnits } from "viem";
import { multiply, toNumber } from "dnum";

import { VaultHelper } from "@/utils/helpers/vaultHelper";
import { useAlchemists } from "@/lib/queries/useAlchemists";
import { useGetMultipleTokenPrices } from "@/lib/queries/useTokenPrice";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { useVaults } from "@/lib/queries/useVaults";
import { Token, Vault } from "@/lib/types";
import { formatNumber } from "@/utils/number";

export const VaultsMetrics = () => {
  const { data: alchemists } = useAlchemists();
  const { data: vaults } = useVaults();
  // TODO: DefiLlama has missing price for alETH on Arb. Possible somewhere else too. So we take underlying price. Which is more than real value, but better than 0.
  const debtTokenPrices = useGetMultipleTokenPrices(
    alchemists?.map((alchemist) => alchemist.underlyingTokens[0]),
  );
  const underlyingTokensPrices = useGetMultipleTokenPrices(
    vaults?.map((vault) => vault.underlyingToken),
  );

  const { data: tokens } = useTokensQuery();

  const totalDeposit = useMemo(
    () => calculateTotalDeposit(tokens, vaults, underlyingTokensPrices),
    [tokens, underlyingTokensPrices, vaults],
  );

  const totalDebt = useMemo(() => {
    return calculateTotalDebt(alchemists, debtTokenPrices);
  }, [alchemists, debtTokenPrices]);

  const availableCredit = useMemo(
    () => calculateAvailableCredit(alchemists, debtTokenPrices, totalDebt),
    [alchemists, debtTokenPrices, totalDebt],
  );

  const globalTVL = useMemo(
    () => calculateGlobalTVL(tokens, vaults, underlyingTokensPrices),
    [tokens, underlyingTokensPrices, vaults],
  );

  return (
    <div className="rounded bg-grey10inverse dark:bg-grey10">
      <div className="px-6 py-4">
        <div className="flex flex-col justify-between gap-2 font-alcxTitles text-lg tracking-wide md:flex-row">
          <div className="flex-col">
            <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
              Total Deposit
            </div>
            <div className="flex">
              <div className="mr-2 flex">
                {formatNumber(totalDeposit, { decimals: 2, isCurrency: true })}
              </div>
            </div>
          </div>
          <div className="flex-col">
            <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
              Current Debt
            </div>
            <div className="flex">
              <div className="mr-2 flex">
                {formatNumber(totalDebt, {
                  decimals: 2,
                  isCurrency: true,
                  allowNegative: false,
                })}
              </div>
            </div>
          </div>
          <div className="flex-col">
            <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
              Available Credit
            </div>
            <div className="flex">
              <div className="mr-2 flex">
                {formatNumber(availableCredit, {
                  decimals: 2,
                  isCurrency: true,
                  allowNegative: false,
                })}
              </div>
            </div>
          </div>
          <div className="flex-col border-t border-dashed border-bronze3 md:border-l md:border-t-0 md:pl-6 md:pt-0">
            <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
              Global TVL
            </div>
            <div className="flex">
              <div className="mr-2 flex">
                {formatNumber(globalTVL, { decimals: 2, isCurrency: true })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function calculateTotalDeposit(
  tokens: Token[] | undefined,
  vaults: Vault[] | undefined,
  underlyingTokensPrices: UseQueryResult<number, Error>[],
) {
  return vaults?.reduce((previousValue, currentVault, i) => {
    const vaultHelper = new VaultHelper(currentVault);

    const sharesBalanceInUnderlying =
      vaultHelper.convertSharesToUnderlyingTokens(currentVault.position.shares);

    const vaultUnderlyingTokenData = tokens?.find(
      (t) =>
        t.address.toLowerCase() === currentVault.underlyingToken.toLowerCase(),
    );

    const tokenPrice = underlyingTokensPrices[i].data;

    if (!tokenPrice) {
      return previousValue + 0;
    }

    if (!vaultUnderlyingTokenData) {
      return previousValue + 0;
    }

    return (
      previousValue +
      toNumber(
        multiply(tokenPrice, [
          sharesBalanceInUnderlying,
          vaultUnderlyingTokenData.decimals,
        ]),
      )
    );
  }, 0);
}

function calculateTotalDebt(
  alchemists: ReturnType<typeof useAlchemists>["data"],
  debtTokensPrices: UseQueryResult<number, Error>[],
) {
  if (!alchemists) return 0;
  let debt = 0;
  for (let i = 0; i < alchemists.length; i++) {
    const alchemist = alchemists[i];
    const debtTokenPrice = debtTokensPrices[i].data;

    const rawDebt = alchemist.position.debt;

    if (debtTokenPrice) {
      debt += toNumber(multiply(debtTokenPrice, [rawDebt, 18]));
    }
  }

  return debt;
}

function calculateAvailableCredit(
  alchemists: ReturnType<typeof useAlchemists>["data"],
  debtTokensPrices: UseQueryResult<number, Error>[],
  totalDebt: number,
) {
  let availableCreditWithoutDebt = 0;
  if (!alchemists) return 0;

  for (let i = 0; i < alchemists.length; i++) {
    const alchemist = alchemists[i];
    const totalValue = alchemist.totalValue;
    const tokenPrice = debtTokensPrices[i].data;

    if (!tokenPrice) {
      continue;
    }

    const totalDepositValue = toNumber(multiply(tokenPrice, [totalValue, 18]));

    const ratio = +formatEther(alchemist.minimumCollateralization ?? 0n);

    const debtLimit = totalDepositValue / ratio;

    availableCreditWithoutDebt += debtLimit;
  }

  const availableCredit = availableCreditWithoutDebt - totalDebt;
  return availableCredit;
}

function calculateGlobalTVL(
  tokens: Token[] | undefined,
  vaults: Vault[] | undefined,
  underlyingTokensPrices: UseQueryResult<number, Error>[],
) {
  return vaults?.reduce((prevValue, currVault, i) => {
    const vaultHelper = new VaultHelper(currVault);

    const vaultTVL = vaultHelper.convertSharesToUnderlyingTokens(
      currVault.yieldTokenParams.totalShares,
    );
    const tokenPrice = underlyingTokensPrices[i].data;

    const vaultUnderlyingTokenData = tokens?.find(
      (t) =>
        t.address.toLowerCase() === currVault.underlyingToken.toLowerCase(),
    );

    if (!vaultUnderlyingTokenData) {
      return prevValue + 0;
    }

    if (!tokenPrice) {
      return prevValue + 0;
    }

    const tvl = parseFloat(
      formatUnits(vaultTVL, vaultUnderlyingTokenData.decimals),
    );

    return prevValue + tokenPrice * tvl;
  }, 0);
}
