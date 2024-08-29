import { useQuery } from "@tanstack/react-query";
import { InfoIcon } from "lucide-react";

import { dayjs } from "@/lib/dayjs";
import { Transmuter } from "@/lib/types";
import { formatNumber } from "@/utils/number";
import { QueryKeys } from "@/lib/queries/queriesSchema";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ONE_DAY_IN_MS } from "@/lib/constants";

interface TransmuterApyDuneQueryResponse {
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

export const TransmuterApy = ({ transmuter }: { transmuter: Transmuter }) => {
  const { data, isError, isPending } = useQuery({
    queryKey: [
      QueryKeys.TransmuterApy,
      transmuter.address,
      transmuter.metadata.apyQueryUri,
    ],
    queryFn: async () => {
      const response = await fetch(
        `${DUNE_API_ENDPOINT}/${transmuter.metadata.apyQueryUri}/results?api_key=${API_KEY}`,
      );
      const data = (await response.json()) as TransmuterApyDuneQueryResponse;

      const apy = data.result.rows[0].projected_yield_rate;
      const timeToTransmute = data.result.rows[0].time_to_transmute;

      if (!apy) {
        throw new Error("APY is not available.");
      }

      return {
        apy,
        timeToTransmute,
      };
    },
    enabled: !!transmuter.metadata.apyQueryUri,
    staleTime: ONE_DAY_IN_MS,
    retry: false,
  });
  return (
    <div className="text-center">
      <p className="text-sm text-lightgrey10">APY</p>
      {isError || !transmuter.metadata.apyQueryUri ? (
        <div className="flex items-center justify-center gap-2">
          <p>N/A</p>
          <NAPopover isError={isError} />
        </div>
      ) : isPending ? (
        <p>...</p>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <p>{formatNumber(data.apy, { allowNegative: false })}%</p>
          <TransmuterApyPopover timeToTransmute={data.timeToTransmute} />
        </div>
      )}
    </div>
  );
};

const TransmuterApyPopover = ({
  timeToTransmute,
}: {
  timeToTransmute: number;
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button onClick={(e) => e.stopPropagation()}>
          <InfoIcon className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        {timeToTransmute > 0 && (
          <p>
            It will take approximately{" "}
            <strong>
              {formatNumber(
                dayjs.duration({ years: timeToTransmute }).asDays(),
              )}{" "}
              days
            </strong>{" "}
            to transmute your deposit.
          </p>
        )}
        <p>
          Yield will <strong>increase</strong>, if more people deposit to
          Alchemix, or liquidate/repay their loans. Yield will{" "}
          <strong>decrease</strong>, if more people deposit alTOKEN in the
          Transmuter.
        </p>
      </PopoverContent>
    </Popover>
  );
};

const NAPopover = ({ isError }: { isError: boolean }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button onClick={(e) => e.stopPropagation()}>
          <InfoIcon className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <p>{isError ? "Error. Report to Alchemix" : "Coming soon!"}</p>
      </PopoverContent>
    </Popover>
  );
};
