import { useChain } from "@/hooks/useChain";
import { mainnet } from "viem/chains";
import { Button } from "@/components/ui/button";
import { useSwitchChain } from "wagmi";
import { useMemo, useState } from "react";
import { useCurveFarm } from "@/lib/queries/farms/useCurveFarm";
import { useSushiFarm } from "@/lib/queries/farms/useSushiFarm";
import { useInternalFarms } from "@/lib/queries/farms/useInternalFarms";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { FarmsAccordionRow } from "./row/FarmsAccordionRow";
import { LiquidityMigration } from "./LiquidityMigration";
import { GAlcsWrapper } from "./GAlcxWrapper";
import { LoadingBar } from "../common/LoadingBar";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { StaticExternalFarms } from "./StaticExternalFarms";

type Filter = "active" | "retired" | "external";

export const Farms = () => {
  const chain = useChain();
  const { switchChain } = useSwitchChain();
  return (
    <>
      {chain.id === mainnet.id && <MainnetFarms />}

      {chain.id !== mainnet.id && (
        <div className="space-y-5">
          <StaticExternalFarms />
          <div className="space-y-2">
            <p>gALCX Wrapper is available on Mainnet</p>
            <Button
              variant="action"
              onClick={() =>
                switchChain({
                  chainId: mainnet.id,
                })
              }
            >
              Switch to Ethereum
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

const MainnetFarms = () => {
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

  const onFilterChain = (filter: string) => {
    setFilter(filter as Filter);
  };

  return (
    <div className="space-y-5">
      <GAlcsWrapper />
      <StaticExternalFarms />
      <LiquidityMigration />
      <div>
        {isPending ? (
          <div className="rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
            <div className="flex space-x-4 bg-grey10inverse px-6 py-4 dark:bg-grey10">
              <p className="inline-block self-center">Fetching data</p>
            </div>
            <div className="my-4 flex justify-center">
              <LoadingBar />
            </div>
          </div>
        ) : null}
        {isError && <div>Error. Unexpected. Contact Alchemix team.</div>}
        {filteredFarms && (
          <div className="rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
            <div className="flex space-x-4 bg-grey10inverse px-6 py-4 dark:bg-grey10">
              <Tabs
                value={filter}
                onValueChange={onFilterChain}
                className="w-full"
              >
                <ScrollArea className="max-w-full">
                  <div className="relative h-6 w-full">
                    <TabsList className="absolute h-auto">
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="retired">Retired</TabsTrigger>
                      <TabsTrigger value="external">External</TabsTrigger>
                    </TabsList>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </Tabs>
            </div>
            <Accordion type="single" collapsible className="space-y-4 p-4">
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
  );
};
