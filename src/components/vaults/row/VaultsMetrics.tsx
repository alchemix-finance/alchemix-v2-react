import { VaultHelper } from "@/utils/helpers/vaultHelper";
import { useAlchemists } from "@/lib/queries/useAlchemists";
import { useGetMultipleTokenPrices } from "@/lib/queries/useTokenPrice";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { useVaults } from "@/lib/queries/useVaults";
import { Token, Vault } from "@/lib/types";
import { formatNumber } from "@/utils/number";
import { UseQueryResult } from "@tanstack/react-query";
import { useMemo } from "react";
import { formatEther, formatUnits } from "viem";

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
    return calculateTotalDebt(alchemists, debtTokenPrices, vaults);
  }, [alchemists, debtTokenPrices, vaults]);

  const availableCredit = useMemo(
    () =>
      calculateAvailableCredit(
        alchemists,
        tokens,
        vaults,
        underlyingTokensPrices,
      ) - totalDebt,
    [alchemists, tokens, totalDebt, underlyingTokensPrices, vaults],
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
                {formatNumber(totalDebt, { decimals: 2, isCurrency: true })}
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

    const sharesBalance = vaultHelper.convertSharesToUnderlyingTokens(
      currentVault.position.shares,
    );

    const vaultUnderlyingTokenData = tokens?.find(
      (t) =>
        t.address.toLowerCase() === currentVault.underlyingToken.toLowerCase(),
    );
    const tokenPrice = underlyingTokensPrices[i].data;

    if (!vaultUnderlyingTokenData) {
      return previousValue + 0;
    }

    const amountTokens = formatUnits(
      sharesBalance,
      vaultUnderlyingTokenData.decimals,
    );

    if (!tokenPrice) {
      return previousValue + 0;
    }

    return previousValue + tokenPrice * parseFloat(amountTokens);
  }, 0);
}

function calculateTotalDebt(
  alchemists: ReturnType<typeof useAlchemists>["data"],
  debtTokenPrices: UseQueryResult<number, Error>[],
  vaults: Vault[] | undefined,
) {
  if (!alchemists) return 0;
  let debt = 0;
  for (let i = 0; i < alchemists.length; i++) {
    const alchemist = alchemists[i];
    const debtTokenPrice = debtTokenPrices[i].data;
    const filteredVaults = vaults?.filter(
      (vault) =>
        vault.alchemist.address.toLowerCase() ===
        alchemist.address.toLowerCase(),
    );

    const rawDebt = formatEther(alchemist.position.debt);

    if ((!!filteredVaults && filteredVaults.length === 0) || !debtTokenPrice) {
      debt += 0;
    } else {
      debt += debtTokenPrice * parseFloat(rawDebt);
    }
  }

  if (debt < 0) {
    debt = 0;
  }

  return debt;
}

function calculateAvailableCredit(
  alchemists: ReturnType<typeof useAlchemists>["data"],
  tokens: Token[] | undefined,
  vaults: Vault[] | undefined,
  tokenPrices: UseQueryResult<number, Error>[],
) {
  let availableCredit = 0;
  if (!vaults) return 0;

  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i];
    const tokenPrice = tokenPrices[i].data;

    const vaultHelper = new VaultHelper(vault);

    const sharesBalance = vaultHelper.convertSharesToUnderlyingTokens(
      vault.position.shares,
    );

    const vaultUnderlyingTokenData = tokens?.find(
      (t) => t.address.toLowerCase() === vault.underlyingToken.toLowerCase(),
    );

    if (!vaultUnderlyingTokenData) {
      continue;
    }

    const alchemist = alchemists?.find(
      (al) =>
        al.address.toLowerCase() === vault.alchemist.address.toLowerCase(),
    );

    const ratio = parseFloat(
      formatEther(alchemist?.minimumCollateralization ?? 0n),
    );

    if (tokenPrice) {
      const tokensValue =
        tokenPrice *
        parseFloat(
          formatUnits(sharesBalance, vaultUnderlyingTokenData.decimals),
        );

      const debtLimit = tokensValue / ratio;

      availableCredit += debtLimit;
    }
  }

  return availableCredit;
}

function calculateGlobalTVL(
  tokens: Token[] | undefined,
  vaults: Vault[] | undefined,
  tokenPrices: UseQueryResult<number, Error>[],
) {
  return vaults?.reduce((prevValue, currVault, i) => {
    const vaultHelper = new VaultHelper(currVault);

    const vaultTVL = vaultHelper.convertSharesToUnderlyingTokens(
      currVault.yieldTokenParams.totalShares,
    );
    const tokenPrice = tokenPrices[i].data;

    const vaultUnderlyingTokenData = tokens?.find(
      (t) =>
        t.address.toLowerCase() === currVault.underlyingToken.toLowerCase(),
    );

    if (!vaultUnderlyingTokenData) {
      return prevValue + 0;
    }

    const tvl = parseFloat(
      formatUnits(vaultTVL, vaultUnderlyingTokenData.decimals),
    );

    if (!tokenPrice) {
      return prevValue + 0;
    }

    return prevValue + tokenPrice * tvl;
  }, 0);
}
