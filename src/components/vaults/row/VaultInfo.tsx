import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { dayjs } from "@/lib/dayjs";

import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Vault } from "@/lib/types";
import { useChain } from "@/hooks/useChain";
import { HARVESTS_ENDPOINTS } from "@/lib/config/harvests";
import { mul, toString } from "dnum";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatNumber } from "@/utils/number";

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

export const VaultInfo = ({ vault }: VaultInfoProps) => {
  const chain = useChain();
  const { data: harvests } = useQuery({
    queryKey: [QueryKeys.Harvests, chain.id, vault.address],
    queryFn: async () => {
      if (chain.id === 250)
        throw new Error("Harvests are not supported on this chain");

      const url = HARVESTS_ENDPOINTS[chain.id];
      const query = gql`
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

      const response = await request<
        {
          alchemistHarvestEvents: HarvestEvent[];
        },
        {
          yieldToken: string;
        }
      >(url, query, {
        yieldToken: vault.address.toLowerCase(),
      });

      const harvests = response.alchemistHarvestEvents;

      const formattedHarvests = harvests.map((harvest) => ({
        ...harvest,
        totalHarvested: toString(
          mul(
            [BigInt(harvest.totalHarvested), vault.yieldTokenParams.decimals],
            0.9,
          ),
        ),
      }));

      return formattedHarvests;
    },
    enabled: chain.id !== 250,
  });
  return (
    <div className="flex w-1/4 flex-col justify-between space-y-3 rounded border border-grey1inverse bg-grey3inverse p-2 dark:border-grey1 dark:bg-grey3">
      <h5 className="font-medium">Harvests</h5>
      <ScrollArea className="h-48">
        <div className="h-max space-y-2">
          {harvests?.map((harvest) => (
            <div key={harvest.transaction.hash}>
              <p>
                {formatNumber(harvest.totalHarvested)}{" "}
                {vault.metadata.yieldSymbol}
              </p>
              <p className="text-sm text-lightgrey10">
                {dayjs(harvest.timestamp * 1000).format("MMM D, YYYY")}
              </p>
            </div>
          ))}
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  );
};
