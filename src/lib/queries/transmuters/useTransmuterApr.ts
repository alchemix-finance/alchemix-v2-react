import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queriesSchema";
import { Transmuter } from "@/lib/types";
import { TransmuterAprDuneQueryResponse } from "@/components/transmuters/row/TransmuterApr";
import { ONE_DAY_IN_MS } from "@/lib/constants";

export const useTransmuterApr = (transmuter: { transmuter: Transmuter }) => {
  const DUNE_API_ENDPOINT = "https://api.dune.com/api/v1/query";
  const API_KEY = import.meta.env.VITE_DUNE_API_KEY;

  return useQuery({
    queryKey: [
      QueryKeys.TransmuterApr,
      transmuter.address,
      transmuter.metadata.aprQueryUri,
      DUNE_API_ENDPOINT,
      API_KEY,
    ],
    queryFn: async () => {
      const response = await fetch(
        `${DUNE_API_ENDPOINT}/${transmuter.metadata.aprQueryUri}/results?api_key=${API_KEY}`,
      );
      const data = (await response.json()) as TransmuterAprDuneQueryResponse;

      const apr = data.result.rows[0].projected_yield_rate;
      const timeToTransmute = data.result.rows[0].time_to_transmute;

      if (apr === undefined || timeToTransmute === undefined) {
        throw new Error("APR fetch failed.");
      }

      return {
        apr,
        timeToTransmute,
      };
    },
    enabled: !!transmuter.metadata.aprQueryUri,
    staleTime: ONE_DAY_IN_MS,
    retry: false,
  });
};
