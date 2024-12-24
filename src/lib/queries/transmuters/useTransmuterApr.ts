import { useQuery } from "@tanstack/react-query";
import { QueryKeys } from "../queriesSchema";
import { Transmuter } from "@/lib/types";
import { ONE_DAY_IN_MS } from "@/lib/constants";

interface TransmuterAprDuneQueryResponse {
  execution_id: string;
  query_id: number;
  is_execution_finished: boolean;
  state: string;
  submitted_at: string;
  expires_at: string;
  execution_started_at: string;
  execution_ended_at: string;
  result: {
    rows: [
      {
        projected_yield_rate: number;
        time_to_transmute: number;
      },
    ];
    metadata: {
      column_names: string[];
      column_types: string[];
      row_count: number;
      result_set_bytes: number;
      total_row_count: number;
      total_result_set_bytes: number;
      datapoint_count: number;
      pending_time_millis: number;
      execution_time_millis: number;
    };
  };
}

const DUNE_API_ENDPOINT = "https://api.dune.com/api/v1/query";
const API_KEY = import.meta.env.VITE_DUNE_API_KEY;

export const useTransmuterApr = (transmuter: Transmuter) => {
  return useQuery({
    queryKey: [
      QueryKeys.TransmuterApr,
      transmuter.address,
      transmuter.metadata.aprQueryUri,
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
