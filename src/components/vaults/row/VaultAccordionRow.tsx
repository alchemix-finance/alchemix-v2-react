import { useMemo, useState } from "react";
import { formatEther, formatUnits } from "viem";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePublicClient, useReadContract, useReadContracts } from "wagmi";
import { AnimatePresence } from "framer-motion";
import { greaterThan, multiply, toString } from "dnum";

import { useChain } from "@/hooks/useChain";
import { SYNTH_ASSETS_METADATA } from "@/lib/config/synths";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { Vault } from "@/lib/types";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetTokenPrice } from "@/lib/queries/useTokenPrice";
import { formatNumber } from "@/utils/number";
import { cn } from "@/utils/cn";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VaultMessage } from "@/components/vaults/row/VaultMessage";
import { Info } from "@/components/vaults/row/Info";
import { Deposit } from "@/components/vaults/row/Deposit";
import { Withdraw } from "@/components/vaults/row/Withdraw";
import { Migrate } from "@/components/vaults/row/Migrate";
import { mainnet, optimism } from "viem/chains";
import { useVaults } from "@/lib/queries/useVaults";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useSettings } from "@/components/providers/SettingsProvider";

type ContentAction = "deposit" | "withdraw" | "migrate" | "info";

export const VaultAccordionRow = ({ vault }: { vault: Vault }) => {
  const chain = useChain();

  const [contentAction, setContentAction] = useState<ContentAction>("deposit");

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

  const { data: vaultStats } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: vault.alchemist.address,
        abi: alchemistV2Abi,
        chainId: chain.id,
        functionName: "convertSharesToUnderlyingTokens",
        args: [vault.yieldToken, vault.yieldTokenParams.totalShares],
      },
      {
        address: vault.alchemist.address,
        abi: alchemistV2Abi,
        chainId: chain.id,
        functionName: "convertSharesToUnderlyingTokens",
        args: [vault.yieldToken, vault.position.shares],
      },
    ] as const,
    query: {
      placeholderData: keepPreviousData,
    },
  });
  const [tvl, sharesBalance] = vaultStats ?? [0n, 0n];

  const vaultLtv =
    100 / parseFloat(formatEther(vault.alchemist.minimumCollateralization));

  return (
    <AccordionItem value={vault.address}>
      <AccordionTrigger className="flex flex-col flex-wrap justify-between gap-5 rounded border border-grey3inverse bg-grey10inverse p-2 py-4 pr-8 data-[state=open]:rounded-b-none data-[state=open]:border-b-0 lg:grid lg:grid-cols-12 lg:gap-2 dark:border-grey3 dark:bg-grey10">
        <div className="col-span-3 flex space-x-8 pl-8">
          <div className="relative">
            {vault.metadata.beta && (
              <img
                src="/images/icons/beta.svg"
                alt="Experimental Vault"
                className="absolute left-0 top-0 w-8"
              />
            )}
            <img
              src={
                SYNTH_ASSETS_METADATA[vault.metadata.synthAssetType]?.icon ??
                "./images/icons/alusd_med.svg"
              }
              alt={
                SYNTH_ASSETS_METADATA[vault.metadata.synthAssetType]?.icon ??
                vault.metadata.label
              }
              className="h-12 w-12"
            />
            <img
              src={`/images/token-icons/${vault.metadata.image}`}
              alt={`${vault.metadata.image} logo`}
              className="absolute left-6 top-6 h-9 w-9"
            />
          </div>
          <div className="text-left">
            <p className="font-bold">{vault.metadata.label}</p>
            <p className="text-sm text-lightgrey10">
              {vault.metadata.underlyingSymbol} / {vault.metadata.yieldSymbol}
            </p>
            <p className="text-sm text-lightgrey10">LTV: {vaultLtv}%</p>
          </div>
        </div>
        <div className="flex w-full lg:hidden">
          <div className="w-full">
            <p className="text-center text-sm text-lightgrey10">Deposit</p>
            <CurrencyCell
              tokenAmount={sharesBalance}
              tokenAddress={vault.underlyingToken}
              tokenSymbol={vaultUnderlyingTokenData?.symbol}
              tokenDecimals={vaultUnderlyingTokenData?.decimals}
            />
          </div>
          <div className="w-full">
            <p className="text-center text-sm text-lightgrey10">TVL</p>
            <CurrencyCell
              tokenAmount={tvl}
              tokenAddress={vault.underlyingToken ?? vault.yieldToken}
              tokenSymbol={vaultUnderlyingTokenData?.symbol}
              tokenDecimals={vaultUnderlyingTokenData?.decimals}
            />
          </div>
        </div>
        <div className="col-span-2 hidden w-full lg:block">
          <p className="text-center text-sm text-lightgrey10">Deposit</p>
          <CurrencyCell
            tokenAmount={sharesBalance}
            tokenAddress={vault.underlyingToken}
            tokenSymbol={vaultUnderlyingTokenData?.symbol}
            tokenDecimals={vaultUnderlyingTokenData?.decimals}
          />
        </div>
        <div className="col-span-3 hidden flex-col px-8 lg:flex">
          <p className="text-center text-sm text-lightgrey10">TVL / Cap</p>
          <VaultCapacityCell
            vault={vault}
            tokenDecimals={vaultUnderlyingTokenData?.decimals}
            tokenSymbol={vaultUnderlyingTokenData?.symbol}
          />
        </div>
        <div className="col-span-4 flex w-full items-center">
          <div className="w-full">
            <p className="text-center text-sm text-lightgrey10">
              {vault.metadata.api.yieldType}
            </p>
            <VaultYieldCell vault={vault} />
          </div>
          <div className="w-full">
            <p className="text-center text-sm text-lightgrey10">Bonus</p>
            <BonusCell vault={vault} />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="rounded-b border border-t-0 border-grey3inverse bg-grey10inverse p-4 dark:border-grey3 dark:bg-grey10">
        <div className="flex w-full flex-col gap-4">
          {vault.metadata.messages.length > 0 &&
            vault.metadata.messages.map((message) => (
              <VaultMessage
                key={message.type + message.message.slice(0, 10)}
                message={message}
              />
            ))}

          <div className="rounded border border-grey1inverse bg-grey3inverse p-2 dark:border-grey1 dark:bg-grey3">
            <Tabs
              value={contentAction}
              onValueChange={(value) =>
                setContentAction(value as ContentAction)
              }
            >
              <ScrollArea className="max-w-full">
                <div className="relative h-8 w-full">
                  <TabsList className="absolute h-auto">
                    <TabsTrigger value="deposit" className="h-8 w-full">
                      Deposit
                    </TabsTrigger>
                    <TabsTrigger value="withdraw" className="h-8 w-full">
                      Withdraw
                    </TabsTrigger>
                    {/* Migration tool only exist on mainnet and optimism */}
                    {(chain.id === mainnet.id || chain.id === optimism.id) && (
                      <TabsTrigger value="migrate" className="h-8 w-full">
                        Migrate
                      </TabsTrigger>
                    )}
                    <TabsTrigger value="info" className="h-8 w-full">
                      Info
                    </TabsTrigger>
                  </TabsList>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </Tabs>
          </div>

          <AnimatePresence initial={false} mode="wait">
            {contentAction === "deposit" &&
              vaultUnderlyingTokenData &&
              vaultYieldTokenData && (
                <Deposit
                  vault={vault}
                  underlyingTokenData={vaultUnderlyingTokenData}
                  yieldTokenData={vaultYieldTokenData}
                  key="deposits"
                />
              )}

            {contentAction === "withdraw" &&
              vaultUnderlyingTokenData &&
              vaultYieldTokenData && (
                <Withdraw
                  vault={vault}
                  underlyingTokenData={vaultUnderlyingTokenData}
                  yieldTokenData={vaultYieldTokenData}
                  key="withdraw"
                />
              )}

            {contentAction === "migrate" &&
              (selectionForMigration?.length ? (
                <Migrate
                  vault={vault}
                  selection={selectionForMigration}
                  key="migrate"
                />
              ) : (
                <p className="text-center" key="migrate">
                  No vaults available for migration
                </p>
              ))}

            {contentAction === "info" && <Info vault={vault} key="info" />}
          </AnimatePresence>
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
  const { currency } = useSettings();

  const tokenAmountFormated = formatUnits(tokenAmount, tokenDecimals);
  const { data: tokenPrice } = useGetTokenPrice(tokenAddress);

  const isDust = !greaterThan([tokenAmount, tokenDecimals], [5n, 18]);
  const amountInCurrency =
    tokenPrice && !isDust
      ? toString(multiply(tokenPrice, [tokenAmount, tokenDecimals]))
      : 0;

  return (
    <div className="flex flex-col items-center text-center">
      <p>
        {formatNumber(tokenAmountFormated, { dustToZero: true, tokenDecimals })}{" "}
        {tokenSymbol}
      </p>
      {tokenPrice && (
        <p className="text-sm text-lightgrey10">
          {formatNumber(amountInCurrency, {
            decimals: 2,
            isCurrency: true,
            currency,
            dustToZero: true,
            tokenDecimals,
          })}
        </p>
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
  const chain = useChain();

  const limitValue = formatUnits(
    vault.yieldTokenParams.maximumExpectedValue,
    tokenDecimals,
  );

  const { data: capacity, isPending } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertSharesToUnderlyingTokens",
    args: [vault.yieldToken, vault.yieldTokenParams.totalShares],
    query: {
      select: (currentValueBn) => {
        const currentValue = formatUnits(currentValueBn, tokenDecimals);
        const isFull =
          (parseFloat(currentValue) / parseFloat(limitValue)) * 100 >= 99;
        return { currentValue, isFull };
      },
      placeholderData: keepPreviousData,
    },
  });

  const progressValue = capacity?.isFull
    ? 100
    : (parseFloat(capacity?.currentValue ?? "0") / parseFloat(limitValue)) *
      100;

  return (
    <>
      <div className="w-full self-start pt-2">
        <div className="relative">
          <Progress value={progressValue} />
        </div>
      </div>
      <div className="mt-2 flex flex-col items-center">
        <p
          className={cn(
            "text-center text-sm text-lightgrey10",
            isPending && "animate-pulse",
          )}
        >
          {capacity?.isFull ? (
            <>
              <span>Full</span>
              <br />
              <span>
                {formatNumber(limitValue, { compact: true })} {tokenSymbol}
              </span>
            </>
          ) : (
            `${formatNumber(capacity?.currentValue ?? "0", { compact: true })}/${formatNumber(limitValue, { compact: true })} ${tokenSymbol}`
          )}
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
    queryKey: [QueryKeys.Bonus, chain.id, publicClient, tokens, vault],
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
          ? `+${formatNumber(bonusData.bonusYieldRate)}% ${bonusData.bonusYieldTokenSymbol}`
          : "-"}
      </p>
      {bonusData?.bonusTimeLimit && (
        <p className="text-center text-sm text-lightgrey10">
          {bonusData.distributionTimeAmount} {bonusData.distributionTimeUnit}{" "}
          left
        </p>
      )}
    </>
  );
};
