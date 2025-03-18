import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { fantom, linea, metis } from "viem/chains";

import { Vault } from "@/lib/types";
import { ONE_DAY_IN_MS } from "@/lib/constants";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { useChain } from "@/hooks/useChain";
import { EARNED_ENDPOINTS } from "@/lib/config/harvests";

export const useVaultEarned = ({ vault }: { vault: Vault }) => {
  const chain = useChain();

  const { address } = useAccount();

  return useQuery({
    queryKey: [QueryKeys.VaultEarned, chain.id, address, vault.address],
    queryFn: async () => {
      if (!address) throw new Error("No address");
      if (
        chain.id === fantom.id ||
        chain.id === linea.id ||
        chain.id === metis.id
      )
        throw new Error("Generated earned is not supported on this chain");

      const url = EARNED_ENDPOINTS[chain.id];

      const earnedQuery = gql`
        query earned($id: String!) {
          depositor(id: $id) {
            totalDonationsReceived
            totalUnderlyingTokenEarned
          }
        }
      `;

      const response = await request<
        {
          depositor: {
            totalDonationsReceived: string;
            totalUnderlyingTokenEarned: string;
          };
        },
        {
          id: string;
        }
      >(url, earnedQuery, {
        id: `${address.toLowerCase()}-${vault.address.toLowerCase()}`,
      });

      if (!response.depositor) return 0;

      const { totalDonationsReceived, totalUnderlyingTokenEarned } =
        response.depositor;

      const totalEarned = +totalUnderlyingTokenEarned + +totalDonationsReceived;

      return totalEarned;
    },
    enabled:
      !!address &&
      chain.id !== fantom.id &&
      chain.id !== linea.id &&
      chain.id !== metis.id,
    staleTime: ONE_DAY_IN_MS,
  });
};
