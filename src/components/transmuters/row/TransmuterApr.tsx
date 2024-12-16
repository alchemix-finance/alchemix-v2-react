import { InfoIcon } from "lucide-react";

import { dayjs } from "@/lib/dayjs";
import { Transmuter } from "@/lib/types";
import { formatNumber } from "@/utils/number";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTransmuterApr } from "@/lib/queries/transmuters/useTransmuterApr";

export const TransmuterApr = ({ transmuter }: { transmuter: Transmuter }) => {
  const { data, isError, isPending } = useTransmuterApr(transmuter);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2">
        <p className="text-sm text-lightgrey10">APR</p>
        <TransmuterAprPopover />
      </div>
      <div className="flex flex-col items-center">
        <p>
          {isError || !transmuter.metadata.aprQueryUri
            ? "N/A"
            : isPending
              ? "..."
              : `${formatNumber(data.apr, { allowNegative: false })}%`}
        </p>
        {!!data?.timeToTransmute && (
          <p className="text-sm text-lightgrey10">
            {formatNumber(
              dayjs.duration({ years: data.timeToTransmute }).asDays(),
              { allowNegative: false },
            )}{" "}
            days
          </p>
        )}
      </div>
    </div>
  );
};

const TransmuterAprPopover = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button onClick={(e) => e.stopPropagation()}>
          <InfoIcon className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="text-sm" onClick={(e) => e.stopPropagation()}>
        <p>
          Users are credited with corresponding assets based on the deposited
          alAsset amount.
          <br />
          The alAsset is burned when user claims the transmuted token.
          <br />
          <br />
          This APR assumes open-market alAsset buy and 1:1 transmute.
        </p>
        <br />
        <a
          href="https://alchemix-finance.gitbook.io/user-docs/alchemix-ecosystem/transmuter"
          target="_blank"
          rel="noreferrer"
          className="underline hover:no-underline"
        >
          Learn more.
        </a>
      </PopoverContent>
    </Popover>
  );
};
