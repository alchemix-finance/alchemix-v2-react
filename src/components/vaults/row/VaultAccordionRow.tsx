import { useChain } from "@/hooks/useChain";
import { SYNTH_ASSETS_METADATA } from "@/lib/config/synths";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { Vault } from "@/lib/types";
import { useMemo } from "react";
import { formatEther, formatUnits } from "viem";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VaultHelper } from "@/lib/helpers/vaultHelper";
import { useGetTokenPrice } from "@/lib/queries/useTokenPrice";
import { formatNumber } from "@/utils/number";
import { cn } from "@/utils/cn";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { serialize, usePublicClient } from "wagmi";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { VaultMessage } from "@/components/vaults/row/VaultMessage";
import { Info } from "@/components/vaults/row/Info";
import { Deposit } from "@/components/vaults/row/Deposit";
import { Withdraw } from "@/components/vaults/row/Withdraw";
import { Migrate } from "@/components/vaults/row/Migrate";
import { useVaultHelper } from "@/hooks/useVaultHelper";
import { mainnet, optimism } from "viem/chains";
import { useVaults } from "@/lib/queries/useVaults";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { QueryKeys } from "@/lib/queries/queriesSchema";

export const VaultAccordionRow = ({ vault }: { vault: Vault }) => {
  const chain = useChain();
  const { data: tokens } = useTokensQuery();
  const { data: vaults } = useVaults();
  const selectionForMigration = useMemo(() => {
    return vaults?.filter(
      (v) =>
        v.address !== vault.address &&
        v.underlyingToken === vault.underlyingToken,
    );
  }, [vault.address, vault.underlyingToken, vaults]);
  const vaultUnderlyingTokenData = useMemo(() => {
    return tokens?.find(
      (token) =>
        token.address.toLowerCase() === vault.underlyingToken.toLowerCase(),
    );
  }, [tokens, vault.underlyingToken]);
  const vaultYieldTokenData = useMemo(() => {
    if (vault.metadata.yieldTokenOverride) {
      return tokens?.find(
        (token) =>
          token.address.toLowerCase() ===
          vault.metadata.yieldTokenOverride!.toLowerCase(),
      );
    } else {
      return tokens?.find(
        (token) =>
          token.address.toLowerCase() === vault.yieldToken.toLowerCase(),
      );
    }
  }, [tokens, vault]);
  const { convertSharesToUnderlyingTokens } = useVaultHelper(vault);
  const vaultStats = useMemo(() => {
    const tvl = convertSharesToUnderlyingTokens(
      vault.yieldTokenParams.totalShares,
    );
    const sharesBalance = convertSharesToUnderlyingTokens(
      vault.position.shares,
    );
    return { tvl, sharesBalance };
  }, [convertSharesToUnderlyingTokens, vault]);

  const vaultLtv =
    100 / parseFloat(formatEther(vault.alchemist.minimumCollateralization));

  return (
    <AccordionItem value={vault.address}>
      <AccordionTrigger className="flex w-full flex-col flex-wrap justify-between gap-5 rounded border border-grey3inverse bg-grey10inverse p-2 hover:cursor-pointer hover:no-underline lg:grid lg:grid-cols-12 lg:gap-2">
        <div className="col-span-3 flex flex-row space-x-8">
          <div className="relative">
            {vault.metadata.beta && (
              <img
                src="./images/icons/beta.svg"
                alt="Experimental Vault"
                className="absolute left-0 top-0 w-8"
              />
            )}
            <img
              src="./images/icons/beta.svg"
              alt="Experimental Vault"
              className="absolute left-0 top-0 w-8"
            />
            <img
              src={
                SYNTH_ASSETS_METADATA[vault.metadata.synthAssetType]?.icon ||
                "./images/icons/alusd_med.svg"
              }
              alt={vault.metadata.label}
              className="h-12 w-12"
            />
            <img
              src={`/images/icons/${vaultYieldTokenData?.symbol.toLowerCase()}.svg`}
              alt={vault.metadata.label}
              className="absolute left-6 top-6 h-9 w-9"
            />
          </div>
          <div>
            <p className="font-bold">{vault.metadata.label}</p>
            <p className="text-sm text-lightgrey10">
              {vaultYieldTokenData?.symbol ?? "..."}
              {vaultUnderlyingTokenData?.symbol ?? "..."}
            </p>
            <p className="text-sm text-lightgrey10">LTV: {vaultLtv}%</p>
          </div>
        </div>
        <div className="flex lg:hidden">
          <div className="flex-2 w-full lg:w-1/6">
            <p className="text-center text-sm text-lightgrey10">Deposit</p>
            <CurrencyCell
              tokenAmount={vaultStats.sharesBalance}
              tokenAddress={vault.underlyingToken}
              tokenSymbol={vaultUnderlyingTokenData?.symbol}
              tokenDecimals={vaultUnderlyingTokenData?.decimals}
            />
          </div>
          <div className="flex-2 w-full">
            <p className="text-center text-sm text-lightgrey10">TVL</p>
            <CurrencyCell
              tokenAmount={vaultStats.tvl}
              tokenAddress={vault.underlyingToken ?? vault.yieldToken}
              tokenSymbol={vaultUnderlyingTokenData?.symbol}
              tokenDecimals={vaultUnderlyingTokenData?.decimals}
            />
          </div>
        </div>
        <div className="flex-2 col-span-2 hidden w-full lg:block">
          <p className="text-center text-sm text-lightgrey10">Deposit</p>
          <CurrencyCell
            tokenAmount={vaultStats.sharesBalance}
            tokenAddress={vault.underlyingToken}
            tokenSymbol={vaultUnderlyingTokenData?.symbol}
            tokenDecimals={vaultUnderlyingTokenData?.decimals}
          />
        </div>
        <div className="flex-2 col-span-4 flex flex-col px-8">
          <p className="text-center text-sm text-lightgrey10">TVL / Cap</p>
          <VaultCapacityCell
            vault={vault}
            tokenDecimals={vaultUnderlyingTokenData?.decimals}
            tokenSymbol={vaultUnderlyingTokenData?.symbol}
          />
        </div>
        <div className="hidden w-full flex-1 self-start lg:block">
          <p className="text-center text-sm text-lightgrey10">
            {vault.metadata.api.yieldType}
          </p>
          <VaultYieldCell vault={vault} />
        </div>
        <div className="hidden w-full flex-1 self-start lg:block">
          <p className="text-center text-sm text-lightgrey10">Bonus</p>
          <BonusCell vault={vault} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="border border-grey10inverse bg-grey15inverse p-4">
        <div className="flex w-full flex-col gap-4">
          {vault.metadata.messages.length > 0 &&
            vault.metadata.messages.map((message) => (
              <VaultMessage
                message={message.content}
                level={message.level as 0 | 1 | 2}
              />
            ))}
          <Tabs defaultValue="deposit">
            <TabsList>
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
              {(chain.id === mainnet.id || chain.id === optimism.id) && (
                <TabsTrigger value="migrate">Migrate</TabsTrigger>
              )}
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="deposit">
              {vaultUnderlyingTokenData && vaultYieldTokenData && (
                <Deposit
                  vault={vault}
                  underlyingTokenData={vaultUnderlyingTokenData}
                  yieldTokenData={vaultYieldTokenData}
                />
              )}
            </TabsContent>
            <TabsContent value="withdraw">
              {vaultUnderlyingTokenData && vaultYieldTokenData && (
                <Withdraw
                  vault={vault}
                  underlyingTokenData={vaultUnderlyingTokenData}
                  yieldTokenData={vaultYieldTokenData}
                />
              )}
            </TabsContent>
            {/* Migration tool only exist on mainnet and optimism */}
            {(chain.id === mainnet.id || chain.id === optimism.id) &&
              !!selectionForMigration?.length && (
                <TabsContent value="migrate">
                  <Migrate vault={vault} selection={selectionForMigration} />
                </TabsContent>
              )}
            {(chain.id === mainnet.id || chain.id === optimism.id) &&
              !selectionForMigration?.length && (
                <TabsContent value="migrate">
                  <p>Migration not available for this vault.</p>
                </TabsContent>
              )}
            <TabsContent value="info">
              <Info vault={vault} />
            </TabsContent>
          </Tabs>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export const CurrencyCell = ({
  tokenAmount,
  tokenAddress,
  tokenDecimals = 18,
  tokenSymbol,
}: {
  tokenAmount: bigint;
  tokenAddress: `0x${string}` | undefined;
  tokenDecimals: number | undefined;
  tokenSymbol: string | undefined;
}) => {
  const tokenAmountFormated = formatUnits(tokenAmount, tokenDecimals);
  const { data: tokenPrice } = useGetTokenPrice(tokenAddress);
  const amount = tokenPrice ? tokenPrice * parseFloat(tokenAmountFormated) : 0;
  return (
    <div className="flex flex-col items-center">
      <p>
        {parseFloat(tokenAmountFormated) === 0
          ? tokenAmountFormated
          : formatNumber(parseFloat(tokenAmountFormated))}
        {tokenSymbol}
      </p>
      {tokenPrice && (
        <p className="text-sm text-lightgrey10">${formatNumber(amount)}</p>
      )}
    </div>
  );
};

const VaultCapacityCell = ({
  vault,
  tokenDecimals = 18,
  tokenSymbol,
}: {
  vault: Vault;
  tokenDecimals: number | undefined;
  tokenSymbol: string | undefined;
}) => {
  const limitValue = formatUnits(
    vault.yieldTokenParams.maximumExpectedValue,
    tokenDecimals,
  );

  const capacity = useMemo(() => {
    const vaultHelper = new VaultHelper(vault);
    const currentValueBN = vaultHelper.convertSharesToUnderlyingTokens(
      vault.yieldTokenParams.totalShares,
    );
    const currentValue = formatUnits(currentValueBN, tokenDecimals);
    const isFull =
      (parseFloat(currentValue) / parseFloat(limitValue)) * 100 >= 99;
    return { currentValue, isFull };
  }, [limitValue, tokenDecimals, vault]);

  return (
    <>
      <div className="w-full self-start pt-2">
        <div className="relative">
          <div className="flex h-2 overflow-hidden rounded border border-bronze1inverse bg-bronze4inverse text-xs">
            <div
              className={cn(
                "flex flex-col justify-center whitespace-nowrap bg-bronze1inverse text-left text-white shadow-none",
              )}
              style={{
                width: capacity.isFull
                  ? "100%"
                  : `${(parseFloat(capacity.currentValue) / parseFloat(limitValue)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center">
        <p className="text-sm text-lightgrey10">
          {capacity.isFull
            ? "VaultFull"
            : `${formatNumber(capacity.currentValue)}/${formatNumber(limitValue)} ${tokenSymbol}`}
        </p>
      </div>
    </>
  );
};

const VaultYieldCell = ({ vault }: { vault: Vault }) => {
  const chain = useChain();
  const { data: apr, isPending } = useQuery({
    queryKey: [
      QueryKeys.Apr,
      chain.id,
      vault.underlyingToken,
      vault.address,
      vault.metadata.yieldTokenOverride,
    ],
    queryFn: () =>
      vault.metadata.api.apr({
        chainId: chain.id,
        underlyingToken: vault.underlyingToken,
        vaultAddress: vault.address,
        yieldTokenOverride: vault.metadata.yieldTokenOverride,
      }),
    placeholderData: keepPreviousData,
  });
  return (
    <div className="flex flex-col items-center">
      <p>{!isPending ? `${formatNumber(apr)}%` : "..."}</p>
    </div>
  );
};

const BonusCell = ({ vault }: { vault: Vault }) => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const { data: tokens } = useTokensQuery();
  const { data: bonusData } = useQuery({
    queryKey: [
      QueryKeys.Bonus,
      chain.id,
      publicClient,
      tokens,
      serialize(vault),
    ],
    queryFn: () =>
      vault.metadata.api.bonus({
        vault,
        chainId: chain.id,
        tokens,
        publicClient,
      }),
    enabled: !!tokens,
    placeholderData: keepPreviousData,
  });
  return (
    <>
      <p className="text-center">
        {bonusData?.hasBonus
          ? `+${formatNumber(bonusData.bonusYieldRate, 4)}% ${bonusData.bonusYieldTokenSymbol}`
          : "-"}
      </p>
      {bonusData?.bonusTimeLimit && (
        <p className="text-center text-sm text-lightgrey10">
          {bonusData.distributionTimeAmount}
          {bonusData.distributionTimeUnit} left
        </p>
      )}
    </>
  );
};
