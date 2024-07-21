import { Accordion } from "@/components/ui/accordion";

import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SYNTH_ASSETS, SynthAsset } from "@/lib/config/synths";
import { useMemo, useState } from "react";
import { useChain } from "@/hooks/useChain";
import { TransmuterAccordionRow } from "@/components/transmuters/row/TransmuterAccordionRow";
import { useTransmuters } from "@/lib/queries/useTransmuters";
import { Button } from "../ui/button";
import { externalLiquidityProviders } from "@/lib/config/externalLiquidityProviders";
import { windowOpen } from "@/utils/windowOpen";

export const Transmuters = () => {
  const chain = useChain();

  const [synthTab, setSynthTab] = useState<"all" | SynthAsset>("all");

  const { data: transmuters, isPending, isSuccess, isError } = useTransmuters();

  const onSynthTabChange = (tab: string) => {
    setSynthTab(tab as "all" | SynthAsset);
  };

  const filteredTransmuters = useMemo(() => {
    return synthTab === "all"
      ? transmuters
      : [...(transmuters ?? [])].filter(
          (transmuter) => transmuter.metadata.synthAsset === synthTab,
        );
  }, [synthTab, transmuters]);

  return (
    <>
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
      {isError && <div>Error</div>}
      {isSuccess && (
        <div className="space-y-5">
          <div className="mb-8">
            <div className="flex justify-between px-6 py-4 text-sm">
              <p className="inline-block self-center">
                External Swap Providers
              </p>
            </div>
            <div className="flex max-h-44 flex-col gap-4 overflow-y-visible px-6 py-4 lg:flex-row lg:overflow-y-hidden">
              {externalLiquidityProviders[chain.id].map((provider) => (
                <Button
                  key={provider.label}
                  className="w-full lg:w-max"
                  onClick={() => windowOpen(provider.url)}
                >
                  <img
                    src={`./images/icons/${provider.icon}`}
                    className="h-5 w-5"
                    alt={`${provider.label} logo`}
                  />
                  {provider.label}
                </Button>
              ))}
            </div>
          </div>
          <Tabs value={synthTab} onValueChange={onSynthTabChange}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={SYNTH_ASSETS.ALETH}>AlETH</TabsTrigger>
              <TabsTrigger value={SYNTH_ASSETS.ALUSD}>AlUSD</TabsTrigger>
            </TabsList>
          </Tabs>
          <Accordion type="single" collapsible>
            {filteredTransmuters && filteredTransmuters.length > 0 ? (
              filteredTransmuters.map((transmuter) => (
                <TransmuterAccordionRow
                  key={transmuter.address}
                  transmuter={transmuter}
                />
              ))
            ) : (
              <div>No transmuters for selected chain and synth asset</div>
            )}
          </Accordion>
        </div>
      )}
    </>
  );
};
