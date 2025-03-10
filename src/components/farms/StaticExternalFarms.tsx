import { STATIC_EXTERNAL_FARMS } from "@/lib/config/farms";
import { windowOpen } from "@/utils/windowOpen";
import { Button } from "../ui/button";
import { useChain } from "@/hooks/useChain";
import { formatNumber } from "@/utils/number";
import {
  useEthArbExternalFarmsAprs,
  useOpExternalFarmsAprs,
} from "@/lib/queries/farms/useExternalFarmsAprs";
import { cn } from "@/utils/cn";

const EthArbExternalApr = ({ tag }: { tag: string }) => {
  const { data: ethArbExternalFarmsArps, isPending } =
    useEthArbExternalFarmsAprs();
  const apr = ethArbExternalFarmsArps?.[tag];
  return (
    <p className={cn("tracking-tight", isPending && "animate-pulse")}>
      {formatNumber(apr)}%
    </p>
  );
};
const OpExternalApr = ({ tag }: { tag: string }) => {
  const { data: opExternalFarmsArps, isPending } = useOpExternalFarmsAprs();
  const apr = opExternalFarmsArps?.[tag];
  return (
    <p className={cn("tracking-tight", isPending && "animate-pulse")}>
      {formatNumber(apr)}%
    </p>
  );
};

export const StaticExternalFarms = () => {
  const chain = useChain();
  const externalFarms = STATIC_EXTERNAL_FARMS[chain.id];
  return (
    <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 relative w-full rounded-sm border">
      <div className="bg-grey10inverse dark:bg-grey10 flex w-full flex-col gap-2 px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-0">
        <p className="text-sm">External Farms</p>
        <Button
          variant="action"
          weight="normal"
          onClick={() => windowOpen("https://alchemix-stats.com/earn")}
          className="border-grey5inverse text-white2inverse/80 hover:text-white2inverse dark:text-white2/80 dark:hover:text-white2 dark:border-grey5 h-8"
        >
          Learn more
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {externalFarms.length > 0 ? (
          externalFarms.map((farm) => (
            <div
              key={farm.name + farm.symbol}
              className="border-grey5inverse bg-grey10inverse dark:bg-grey10 flex flex-col justify-between gap-2 rounded-sm border p-2"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold tracking-tight">{farm.symbol}</p>
                  {farm.name === "Velodrome" ? (
                    <OpExternalApr tag={`${farm.name} ${farm.symbol}`} />
                  ) : (
                    <EthArbExternalApr tag={`${farm.name} ${farm.symbol}`} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={`./images/icons/${farm.icon}`}
                    className="h-5 w-5 rounded-full"
                    alt={`${farm.name} logo`}
                  />
                  {farm.collabicon && (
                    <img
                      src={`./images/icons/${farm.collabicon}`}
                      className="h-5 w-5 rounded-full"
                      alt={`${farm.name} logo`}
                    />
                  )}
                  <h2 className="text-lightgrey10">{farm.name}</h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {farm.actions.map((action) => (
                  <a
                    key={action.url}
                    href={action.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    {action.label}
                  </a>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p>No external farms available on {chain.name}</p>
        )}
      </div>
    </div>
  );
};
