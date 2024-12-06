import { LoadingBar } from "@/components/common/LoadingBar";
import { useChain } from "@/hooks/useChain";
import { dayjs } from "@/lib/dayjs";
import { useHarvests } from "@/lib/queries/vaults/useHarvests";
import { Vault } from "@/lib/types";
import { formatNumber } from "@/utils/number";

export const HarvestsAndBonuses = ({
  vault,
  tab,
}: {
  vault: Vault;
  tab: "harvests" | "bonuses";
}) => {
  const chain = useChain();

  const {
    data: harvestsAndBonuses,
    isPending: isPendingHarvestsAndBonuses,
    isError: isErrorHarvestsAndBonuses,
  } = useHarvests({ vault });

  if (isPendingHarvestsAndBonuses) {
    return (
      <div className="flex h-36 items-center justify-center">
        <LoadingBar />
      </div>
    );
  }

  const selectedEvents =
    tab === "harvests"
      ? harvestsAndBonuses?.harvests
      : harvestsAndBonuses?.bonuses;

  return (
    <>
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
      {(tab == "harvests" || tab === "bonuses") &&
        selectedEvents?.length === 0 && <p>No previous {tab}</p>}
      {(tab == "harvests" || tab === "bonuses") &&
        isErrorHarvestsAndBonuses && <p>Error fetching {tab}</p>}
    </>
  );
};
