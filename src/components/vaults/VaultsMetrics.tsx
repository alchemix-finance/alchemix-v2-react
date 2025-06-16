import { UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import { formatEther, formatUnits } from "viem";
import { multiply, toNumber } from "dnum";
import { VaultHelper } from "@/utils/helpers/vaultHelper";
import { useAlchemists } from "@/lib/queries/useAlchemists";
import { useGetMultipleTokenPrices } from "@/lib/queries/useTokenPrice";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { Token, Vault } from "@/lib/types";
import { formatNumber } from "@/utils/number";
import { useSettings } from "@/components/providers/SettingsProvider";
import { SynthFilter } from "./Vaults";

export interface VaultsMetricsProps {
  filteredVaults: Vault[] | undefined;
  selectedSynth: SynthFilter;
}

export const VaultsMetrics = ({
  filteredVaults,
  selectedSynth,
}: VaultsMetricsProps) => {
  const { currency } = useSettings();

  const { data: alchemists } = useAlchemists();

  const filteredAlchemists = useMemo(() => {
    return selectedSynth === "all"
      ? alchemists
      : alchemists?.filter((alchemist) => {
          return alchemist.synthType === selectedSynth;
        });
  }, [alchemists, selectedSynth]);

  const debtTokenPrices = useGetMultipleTokenPrices([
    ...new Set(
      filteredAlchemists?.map(
        (alchemist) => alchemist.underlyingTokensAddresses[0],
      ),
    ),
  ]);
  const underlyingTokensPrices = useGetMultipleTokenPrices([
    ...new Set(filteredVaults?.map((vault) => vault.underlyingToken)),
  ]);

  const { data: tokens } = useTokensQuery();

  const totalDeposit = useMemo(
    () => calculateTotalDeposit(tokens, filteredVaults, underlyingTokensPrices),
    [tokens, underlyingTokensPrices, filteredVaults],
  );

  const totalDebt = useMemo(() => {
    return calculateTotalDebt(filteredAlchemists, debtTokenPrices);
  }, [filteredAlchemists, debtTokenPrices]);

  const availableCredit = useMemo(
    () =>
      calculateAvailableCredit(filteredAlchemists, debtTokenPrices, totalDebt),
    [filteredAlchemists, debtTokenPrices, totalDebt],
  );

  const globalTVL = useMemo(
    () => calculateGlobalTVL(tokens, filteredVaults, underlyingTokensPrices),
    [tokens, underlyingTokensPrices, filteredVaults],
  );

  return (
    <div className="bg-grey10inverse dark:bg-grey10 rounded-sm">
      <div className="px-6 py-4">
        <div className="font-alcxTitles flex flex-col justify-between gap-2 text-lg tracking-wide md:flex-row">
          <div className="flex-col">
            <div className="text-bronze3 mr-2 text-sm whitespace-nowrap uppercase">
              Total Deposit
            </div>
            <div className="flex">
              <div className="mr-2 flex">
                {formatNumber(totalDeposit, {
                  decimals: 2,
                  isCurrency: true,
                  currency,
                })}
              </div>
            </div>
          </div>
          <div className="flex-col">
            <div className="text-bronze3 mr-2 text-sm whitespace-nowrap uppercase">
              Current Debt
            </div>
            <div className="flex">
              <div className="mr-2 flex">
                {formatNumber(totalDebt, {
                  decimals: 2,
                  isCurrency: true,
                  allowNegative: false,
                  currency,
                })}
              </div>
            </div>
          </div>
          <div className="flex-col">
            <div className="text-bronze3 mr-2 text-sm whitespace-nowrap uppercase">
              Available Credit
            </div>
            <div className="flex">
              <div className="mr-2 flex">
                {formatNumber(availableCredit, {
                  decimals: 2,
                  isCurrency: true,
                  allowNegative: false,
                  currency,
                })}
              </div>
            </div>
          </div>
          <div className="border-bronze3 flex-col border-t border-dashed md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <div className="text-bronze3 mr-2 text-sm whitespace-nowrap uppercase">
              Global TVL
            </div>
            <div className="flex">
              <div className="mr-2 flex">
                {formatNumber(globalTVL, {
                  decimals: 2,
                  isCurrency: true,
                  currency,
                })}
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
  const set = new Set(vaults?.map((vault) => vault.underlyingToken));
  const priceMap = new Map(
    underlyingTokensPrices.map((price, i) => [
      [...set.values()][i],
      price.data,
    ]),
  );
  return vaults?.reduce((previousValue, currentVault) => {
    const vaultHelper = new VaultHelper(currentVault);

    const sharesBalanceInUnderlying =
      vaultHelper.convertSharesToUnderlyingTokens(currentVault.position.shares);

    const vaultUnderlyingTokenData = tokens?.find(
      (t) =>
        t.address.toLowerCase() === currentVault.underlyingToken.toLowerCase(),
    );

    const tokenPrice = priceMap.get(currentVault.underlyingToken);

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
  const set = new Set(
    alchemists.map((alchemist) => alchemist.underlyingTokens[0]),
  );
  const priceMap = new Map(
    debtTokensPrices.map((price, i) => [[...set.values()][i], price.data]),
  );
  for (let i = 0; i < alchemists.length; i++) {
    const alchemist = alchemists[i];
    const debtTokenPrice = priceMap.get(alchemist.underlyingTokens[0]);

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

  const set = new Set(
    alchemists.map((alchemist) => alchemist.underlyingTokens[0]),
  );
  const priceMap = new Map(
    debtTokensPrices.map((price, i) => [[...set.values()][i], price.data]),
  );

  for (let i = 0; i < alchemists.length; i++) {
    const alchemist = alchemists[i];
    const totalValue = alchemist.totalValue;
    const tokenPrice = priceMap.get(alchemist.underlyingTokens[0]);

    if (!tokenPrice) {
      continue;
    }

    const totalDepositValue = toNumber(multiply(tokenPrice, [totalValue, 18]));

    const ratio = +formatEther(alchemist.minimumCollateralization);

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
  const set = new Set(vaults?.map((vault) => vault.underlyingToken));
  const priceMap = new Map(
    underlyingTokensPrices.map((price, i) => [
      [...set.values()][i],
      price.data,
    ]),
  );
  return vaults?.reduce((prevValue, currVault) => {
    const vaultHelper = new VaultHelper(currVault);

    const vaultTVL = vaultHelper.convertSharesToUnderlyingTokens(
      currVault.yieldTokenParams.totalShares,
    );
    const tokenPrice = priceMap.get(currVault.underlyingToken);

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
