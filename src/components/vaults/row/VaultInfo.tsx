import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { formatEther } from "viem";
import { mul, toString } from "dnum";
import { AnimatePresence, m } from "framer-motion";

import { dayjs } from "@/lib/dayjs";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Vault } from "@/lib/types";
import { HARVESTS_ENDPOINTS } from "@/lib/config/harvests";
import { useChain } from "@/hooks/useChain";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatNumber } from "@/utils/number";
import { LoadingBar } from "@/components/common/LoadingBar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ONE_DAY_IN_MS } from "@/lib/constants";

import { MotionDirection, transition, variants } from "./motion";

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

type Tab = "harvests" | "bonuses";

export const VaultInfo = ({ vault }: VaultInfoProps) => {
  const chain = useChain();

  const [tab, setTab] = useState<Tab>("harvests");
  const [motionDirection, setMotionDirection] =
    useState<MotionDirection>("right");

  const { data: harvestsAndBonuses, isPending: isPendingHarvestsAndBonuses } =
    useQuery({
      queryKey: [QueryKeys.Harvests, chain.id, vault.address],
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
              [BigInt(harvest.totalHarvested), vault.yieldTokenParams.decimals],
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

  const onTabChange = (newTab: string) => {
    if (newTab === tab) return;
    setMotionDirection(newTab === "bonuses" ? "right" : "left");
    setTab(newTab as Tab);
  };

  const selectedEvents =
    tab === "harvests"
      ? harvestsAndBonuses?.harvests
      : harvestsAndBonuses?.bonuses;

  return (
    <div className="flex w-full flex-col space-y-5 rounded border border-grey1inverse md:w-1/3 dark:border-grey1">
      <div className="rounded-t border-b border-grey1inverse bg-grey3inverse p-2 dark:border-grey1 dark:bg-grey3">
        <Tabs value={tab} onValueChange={onTabChange}>
          <ScrollArea className="max-w-full">
            <div className="relative h-8 w-full">
              <TabsList className="absolute h-auto">
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
      {isPendingHarvestsAndBonuses ? (
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
              variants={variants}
              transition={transition}
              initial="enter"
              animate="center"
              exit="exit"
              custom={motionDirection}
              className="space-y-2 px-3"
            >
              {selectedEvents?.map((event) => (
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
                        {formatNumber(event.amount)} {vault.alchemist.synthType}
                      </p>
                    )}
                    {event.type === "Harvest" && "totalHarvested" in event && (
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
              {selectedEvents?.length === 0 && <p>No previous {tab}</p>}
            </m.div>
            <ScrollBar />
          </AnimatePresence>
        </ScrollArea>
      )}
    </div>
  );
};
