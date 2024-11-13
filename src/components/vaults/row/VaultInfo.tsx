import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { formatEther } from "viem";
import { mul, toString } from "dnum";

import { dayjs } from "@/lib/dayjs";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Vault } from "@/lib/types";
import { HARVESTS_ENDPOINTS } from "@/lib/config/harvests";
import { useChain } from "@/hooks/useChain";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatNumber } from "@/utils/number";
import { LoadingBar } from "@/components/common/LoadingBar";
import { ONE_DAY_IN_MS } from "@/lib/constants";

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

export const VaultInfo = ({ vault }: VaultInfoProps) => {
  const chain = useChain();
  const {
    data: harvestsAndDonations,
    isPending: isPendingHarvestsAndDonations,
  } = useQuery({
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
        type: "Donation",
        amount: formatEther(BigInt(donation.amount)),
      }));

      const events = [...formattedHarvests, ...donationsFormatted].sort(
        (a, b) => b.timestamp - a.timestamp,
      );

      return events;
    },
    enabled: chain.id !== 250,
    staleTime: ONE_DAY_IN_MS,
  });

  return (
    <div className="flex w-1/3 flex-col space-y-5 rounded border border-grey1inverse bg-grey3inverse p-3 dark:border-grey1 dark:bg-grey3">
      <h5 className="font-medium">Harvests & Donations</h5>
      {isPendingHarvestsAndDonations ? (
        <div className="flex h-full items-center justify-center">
          <LoadingBar />
        </div>
      ) : (
        <ScrollArea className="h-36">
          <div className="space-y-2 px-3">
            {harvestsAndDonations?.map((event) => (
              <div key={event.transaction.hash}>
                <div className="flex justify-between">
                  <a
                    href={`${chain.blockExplorers.default.url}/tx/${event.transaction.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:no-underline"
                  >
                    {event.type}
                  </a>
                  {event.type === "Donation" && "amount" in event && (
                    <p>
                      {formatNumber(event.amount)} {vault.alchemist.synthType}
                    </p>
                  )}
                  {event.type === "Harvest" && "totalHarvested" in event && (
                    <p>
                      {formatNumber(event.totalHarvested)}{" "}
                      {vault.metadata.yieldSymbol}
                    </p>
                  )}
                </div>
                <p className="text-right text-sm text-lightgrey10">
                  {dayjs(event.timestamp * 1000).format("MMM D, YYYY")}
                </p>
              </div>
            ))}
            {harvestsAndDonations?.length === 0 && <p>No previous harvests</p>}
          </div>
          <ScrollBar />
        </ScrollArea>
      )}
    </div>
  );
};
