import { STATIC_EXTERNAL_FARMS } from "@/lib/config/farms";
import { windowOpen } from "@/utils/windowOpen";
import { Button } from "../ui/button";
import { useChain } from "@/hooks/useChain";

export const StaticExternalFarms = () => {
  const chain = useChain();
  const externalFarms = STATIC_EXTERNAL_FARMS[chain.id];
  return (
    <div className="relative w-full rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
      <div className="flex w-full flex-col gap-2 bg-grey10inverse px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-0 dark:bg-grey10">
        <p className="text-sm">External Farms</p>
        <Button
          variant="action"
          weight="normal"
          onClick={() => windowOpen("https://alchemix-stats.com/earn")}
          className="h-8 border-grey5inverse text-opacity-80 hover:text-opacity-100 dark:border-grey5"
        >
          Learn more
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-8 p-4 sm:grid-cols-2 xl:grid-cols-3">
        {externalFarms.length > 0 ? (
          externalFarms.map((farm) => (
            <div
              key={farm.name + farm.symbol}
              className="flex flex-col justify-between gap-2 rounded border border-grey5inverse bg-grey10inverse p-2 dark:bg-grey10"
            >
              <div className="space-y-1">
                <p className="font-semibold tracking-tight">{farm.symbol}</p>
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
                {/* <p className="text-sm">{farm.subtitle}</p> */}
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
