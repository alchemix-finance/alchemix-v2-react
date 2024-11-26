import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { formatEther } from "viem";
import { mul, toString } from "dnum";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";

import { dayjs } from "@/lib/dayjs";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Vault } from "@/lib/types";
import { HARVESTS_ENDPOINTS } from "@/lib/config/harvests";
import { ONE_DAY_IN_MS } from "@/lib/constants";
import { useChain } from "@/hooks/useChain";
import { formatNumber } from "@/utils/number";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { LoadingBar } from "@/components/common/LoadingBar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  MotionDirection,
  reducedMotionVariants,
  transition,
  variants,
} from "./motion";
import { AprHistoricalChart } from "./AprHistoricalChart";

interface VaultInfoProps {
  vault: Vault;
}

interface HarvestEvent {
  totalHarvested: string; // wei
  transaction: {
    hash: `0x${string}`;
  };
  yieldToken: `0x${string}`;
  timestamp: number;
}

interface DonateEvent {
  timestamp: number;
  yieldToken: `0x${string}`;
  amount: string; // wei
  transaction: {
    hash: `0x${string}`;
  };
}

type Tab = "apr" | "harvests" | "bonuses";

export const VaultInfo = ({ vault }: VaultInfoProps) => {
  const chain = useChain();

  const [tab, setTab] = useState<Tab>("apr");
  const [motionDirection, setMotionDirection] =
    useState<MotionDirection>("right");
  const isReducedMotion = useReducedMotion();

  const {
    data: harvestsAndBonuses,
    isPending: isPendingHarvestsAndBonuses,
    isError: isErrorHarvestsAndBonuses,
  } = useQuery({
    queryKey: [QueryKeys.HarvestsAndBonuses, chain.id, vault.address],
    queryFn: async () => {
      if (chain.id === 250)
        throw new Error("Harvests are not supported on this chain");

      const url = HARVESTS_ENDPOINTS[chain.id];

      const harvestsQuery = gql`
        query harvests($yieldToken: String!) {
          alchemistHarvestEvents(
            where: { yieldToken: $yieldToken }
            orderBy: timestamp
            orderDirection: desc
          ) {
            totalHarvested
            transaction {
              hash
            }
            yieldToken
            timestamp
          }
        }
      `;

      const donationsQuery = gql`
        query donations($yieldToken: String!) {
          alchemistDonateEvents(
            where: { yieldToken: $yieldToken }
            orderBy: timestamp
            orderDirection: desc
          ) {
            timestamp
            yieldToken
            amount
            transaction {
              hash
            }
          }
        }
      `;

      const harvestsPromise = request<
        {
          alchemistHarvestEvents: HarvestEvent[];
        },
        {
          yieldToken: string;
        }
      >(url, harvestsQuery, {
        yieldToken: vault.address.toLowerCase(),
      });

      const donationsPromise = request<
        {
          alchemistDonateEvents: DonateEvent[];
        },
        {
          yieldToken: string;
        }
      >(url, donationsQuery, {
        yieldToken: vault.address.toLowerCase(),
      });

      const [harvestsResponse, donationsResponse] = await Promise.all([
        harvestsPromise,
        donationsPromise,
      ]);

      const harvests = harvestsResponse.alchemistHarvestEvents;
      const donations = donationsResponse.alchemistDonateEvents;

      const formattedHarvests = harvests.map((harvest) => ({
        ...harvest,
        type: "Harvest",
        totalHarvested: toString(
          mul(
            [
              BigInt(harvest.totalHarvested),
              vault.underlyingTokensParams.decimals,
            ],
            0.9,
          ),
        ),
      }));

      const donationsFormatted = donations.map((donation) => ({
        ...donation,
        type: "Bonus",
        amount: formatEther(BigInt(donation.amount)),
      }));

      return { harvests: formattedHarvests, bonuses: donationsFormatted };
    },
    enabled: chain.id !== 250,
    staleTime: ONE_DAY_IN_MS,
  });

  const { data: historicData, isPending: isPendingHistoricApr } = useQuery({
    queryKey: [QueryKeys.HistoricYield, chain.id],
    queryFn: async () => {
      if (chain.id === 250)
        throw new Error("Historic yield data is not supported on this chain");

      const fileName =
        chain.id === 1
          ? "mainnetDailyAprs.csv"
          : chain.id === 10
            ? "optimismDailyAprs.csv"
            : "arbitrumDailyAprs.csv";
      const response = await fetch(
        `https://api.pinata.cloud/data/pinList?includeCount=false&metadata[name]=${fileName}&status=pinned&pageLimit=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_KEY}`,
          },
        },
      );
      const data = await response.json();
      const pinataHash = data.rows[0].ipfs_pin_hash as string;
      const url = `https://ipfs.imimim.info/ipfs/${pinataHash}`;
      const responseCsv = await fetch(url);
      const csv = await responseCsv.text();
      const lines = csv.split("\n");
      const parsedData = lines.slice(1).map((line) => {
        const values = line.split(",");
        return {
          name: values[1],
          timestamp: parseInt(values[0]),
          formattedDate: dayjs.unix(parseInt(values[0])).format("MMM D"),
          apr: +values[2] * 100,
        };
      });
      return parsedData;
    },
    enabled: chain.id !== 250,
    staleTime: ONE_DAY_IN_MS,
  });

  const onTabChange = (newTab: string) => {
    if (newTab === tab) return;
    const array = ["apr", "harvests", "bonuses"];
    const indexOfCurrentAction = array.indexOf(tab);
    const indexOfNewAction = array.indexOf(newTab);
    if (indexOfNewAction > indexOfCurrentAction) {
      setMotionDirection("right");
    } else setMotionDirection("left");
    setTab(newTab as Tab);
  };

  const selectedEvents =
    tab === "harvests"
      ? harvestsAndBonuses?.harvests
      : harvestsAndBonuses?.bonuses;

  const isPending =
    tab === "apr" ? isPendingHistoricApr : isPendingHarvestsAndBonuses;

  const vaultHistoricData = historicData?.filter(
    (data) => data.name === vault.metadata.yieldSymbol,
  );

  return (
    <div className="flex w-full flex-col space-y-5 rounded border border-grey1inverse md:w-1/3 dark:border-grey1">
      <div className="rounded-t border-b border-grey1inverse bg-grey3inverse p-2 dark:border-grey1 dark:bg-grey3">
        <Tabs value={tab} onValueChange={onTabChange}>
          <ScrollArea className="max-w-full">
            <div className="relative h-8 w-full">
              <TabsList className="absolute h-auto">
                <TabsTrigger value="apr" className="h-8 w-full">
                  APR
                </TabsTrigger>
                <TabsTrigger value="harvests" className="h-8 w-full">
                  Harvests
                </TabsTrigger>
                <TabsTrigger value="bonuses" className="h-8 w-full">
                  Bonuses
                </TabsTrigger>
              </TabsList>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>
      </div>
      {chain.id !== 250 && isPending ? (
        <div className="flex h-full items-center justify-center">
          <LoadingBar />
        </div>
      ) : (
        <ScrollArea className="h-36">
          <AnimatePresence
            initial={false}
            mode="popLayout"
            custom={motionDirection}
          >
            <m.div
              key={tab}
              variants={isReducedMotion ? reducedMotionVariants : variants}
              transition={transition}
              initial="enter"
              animate="center"
              exit="exit"
              custom={motionDirection}
              className="space-y-2 px-3"
            >
              {tab !== "apr" &&
                selectedEvents?.map((event) => (
                  <div key={event.transaction.hash + event.type}>
                    <div className="flex justify-between">
                      <a
                        href={`${chain.blockExplorers.default.url}/tx/${event.transaction.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:no-underline"
                      >
                        {event.type}
                      </a>
                      {event.type === "Bonus" && "amount" in event && (
                        <p>
                          {formatNumber(event.amount)}{" "}
                          {vault.alchemist.synthType}
                        </p>
                      )}
                      {event.type === "Harvest" &&
                        "totalHarvested" in event && (
                          <p>
                            {formatNumber(event.totalHarvested)}{" "}
                            {vault.metadata.underlyingSymbol}
                          </p>
                        )}
                    </div>
                    <p className="text-right text-sm text-lightgrey10">
                      {dayjs(event.timestamp * 1000).format("MMM D, YYYY")}
                    </p>
                  </div>
                ))}
              {tab !== "apr" && selectedEvents?.length === 0 && (
                <p>No previous {tab}</p>
              )}
              {tab !== "apr" && isErrorHarvestsAndBonuses && (
                <p>Error fetching {tab}</p>
              )}
              {tab === "apr" && chain.id !== 250 && (
                <AprHistoricalChart vaultHistoricData={vaultHistoricData} />
              )}
              {chain.id === 250 && <p>Not supported on {chain.name}</p>}
            </m.div>
            <ScrollBar />
          </AnimatePresence>
        </ScrollArea>
      )}
    </div>
  );
};
