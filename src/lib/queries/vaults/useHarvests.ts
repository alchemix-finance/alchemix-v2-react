import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { formatEther } from "viem";
import { mul, toString } from "dnum";

import { QueryKeys } from "@/lib/queries/queriesSchema";
import { HARVESTS_ENDPOINTS } from "@/lib/config/harvests";
import { ONE_DAY_IN_MS } from "@/lib/constants";
import { useChain } from "@/hooks/useChain";
import { Vault } from "@/lib/types";

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

export const useHarvests = ({ vault }: { vault: Vault }) => {
  const chain = useChain();
  return useQuery({
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
};
