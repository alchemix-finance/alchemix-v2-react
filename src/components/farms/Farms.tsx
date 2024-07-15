import { useChain } from "@/hooks/useChain";
import { mainnet } from "viem/chains";
import { Button } from "@/components/ui/button";
import { useSwitchChain } from "wagmi";
import { useMemo, useState } from "react";
import { useCurveFarm } from "@/lib/queries/farms/useCurveFarm";
import { useSushiFarm } from "@/lib/queries/farms/useSushiFarm";
import { useInternalFarms } from "@/lib/queries/farms/useInternalFarms";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { FarmsAccordionRow } from "./row/FarmsAccordionRow";
import { staticExternalFarms } from "@/lib/config/farms";

type Filter = "active" | "retired" | "external";

export const Farms = () => {
  const chain = useChain();

  const [filter, setFilter] = useState<Filter>("active");

  const {
    data: internalFarms,
    isPending: isPendingInternalFarms,
    isError: isErrorInternalFarms,
  } = useInternalFarms();
  const {
    data: sushiFarm,
    isPending: isPendingSushi,
    isError: isErrorSushi,
  } = useSushiFarm();
  const {
    data: curveFarm,
    isPending: isPendingCurve,
    isError: isErrorCurve,
  } = useCurveFarm();

  const isPending = isPendingInternalFarms || isPendingSushi || isPendingCurve;
  const isError = isErrorInternalFarms || isErrorSushi || isErrorCurve;

  const filteredFarms = useMemo(() => {
    if (!internalFarms || !sushiFarm || !curveFarm) return;

    const farms = [...internalFarms, sushiFarm, curveFarm];

    if (filter === "active") {
      return farms.filter((farm) => farm.isActive);
    }
    if (filter === "retired") {
      return farms.filter((farm) => !farm.isActive);
    }
    if (filter === "external") {
      return [sushiFarm, curveFarm];
    }
  }, [curveFarm, filter, internalFarms, sushiFarm]);

  const { switchChain } = useSwitchChain();

  const onFilterChain = (filter: string) => {
    setFilter(filter as Filter);
  };

  return (
    <>
      {chain.id === mainnet.id && (
        <div className="space-y-5">
          <p>Liquidity Migration here</p>
          <p>gALCX Wrapper here</p>
          <div>
            {isPending ? (
              <div className="rounded border border-grey10inverse bg-grey15inverse">
                <div slot="header" className="flex space-x-4 px-6 py-4">
                  <p className="inline-block self-center">Fetching data</p>
                </div>
                <div slot="body">
                  <div className="my-4 flex justify-center">
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </div>
            ) : null}
            {isError && <div>Error. Unexpected. Contact Alchemix team.</div>}
            {filteredFarms && (
              <div className="space-y-5">
                <div className="mb-8 space-y-2 px-6 py-4">
                  <p className="text-sm">External Farms</p>
                  <div className="flex flex-wrap gap-4">
                    {staticExternalFarms.map((farm) => (
                      <div
                        key={farm.name}
                        className="flex w-64 flex-col justify-between gap-2 border p-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <img
                              src={`./images/icons/${farm.icon}`}
                              className="h-5 w-5 rounded-full"
                              alt={`${farm.name} logo`}
                            />
                            <h2 className="font-semibold tracking-tight">
                              {farm.name}
                            </h2>
                          </div>
                          <p className="text-sm">{farm.subtitle}</p>
                        </div>
                        <div>
                          {farm.actions.map((action) => (
                            <Button
                              key={action.url}
                              variant="link"
                              onClick={() => window.open(action.url, "_blank")}
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Tabs value={filter} onValueChange={onFilterChain}>
                  <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="retired">Retired</TabsTrigger>
                    <TabsTrigger value="external">External</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Accordion type="single" collapsible>
                  {filteredFarms.length > 0 ? (
                    filteredFarms.map((farm) => (
                      <FarmsAccordionRow key={farm.uuid} farm={farm} />
                    ))
                  ) : (
                    <div>No vaults for selected chain and synth asset</div>
                  )}
                </Accordion>
              </div>
            )}
          </div>
        </div>
      )}

      {chain.id !== mainnet.id && (
        <div>
          <p>Farms only supported on Ethereum Mainnet currently.</p>
          <Button
            onClick={() =>
              switchChain({
                chainId: mainnet.id,
              })
            }
          >
            Switch to Ethereum
          </Button>
        </div>
      )}
    </>
  );
};
