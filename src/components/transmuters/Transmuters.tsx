import { Accordion } from "@/components/ui/accordion";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SYNTH_ASSETS, SynthAsset } from "@/lib/config/synths";
import { useMemo, useState } from "react";
import { useChain } from "@/hooks/useChain";
import { TransmuterAccordionRow } from "@/components/transmuters/row/TransmuterAccordionRow";
import { useTransmuters } from "@/lib/queries/useTransmuters";
import { Button } from "../ui/button";
import { EXTERNAL_LIQUIDITY_PROVIDERS } from "@/lib/config/externalLiquidityProviders";
import { windowOpen } from "@/utils/windowOpen";
import { LoadingBar } from "../common/LoadingBar";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";

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
        <div className="rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
          <div className="flex space-x-4 bg-grey10inverse px-6 py-4 dark:bg-grey10">
            <p className="inline-block self-center">Fetching data</p>
          </div>
          <div className="my-4 flex justify-center">
            <LoadingBar />
          </div>
        </div>
      ) : null}
      {isError && <div>Error</div>}
      {isSuccess && (
        <div className="space-y-5">
          <div className="w-full rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
            <div className="bg-grey10inverse px-6 py-4 text-sm dark:bg-grey10">
              <p className="inline-block self-center">
                External Swap Providers
              </p>
            </div>
            <div className="flex max-h-44 flex-col gap-4 overflow-y-auto px-6 py-4 lg:flex-row">
              {EXTERNAL_LIQUIDITY_PROVIDERS[chain.id].map((provider) => (
                <Button
                  key={provider.label}
                  variant="action"
                  weight="normal"
                  className="w-full gap-2 border-grey5inverse lg:w-max dark:border-grey5"
                  onClick={() => windowOpen(provider.url)}
                >
                  <img
                    src={`./alchemix-v2-react/images/icons/${provider.icon}`}
                    className="h-5 w-5"
                    alt={`${provider.label} logo`}
                  />
                  {provider.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
            <div className="bg-grey10inverse px-6 py-4 dark:bg-grey10">
              <Tabs value={synthTab} onValueChange={onSynthTabChange}>
                <ScrollArea className="max-w-full">
                  <div className="relative h-7 w-full">
                    <TabsList className="absolute h-auto">
                      <TabsTrigger value="all" className="space-x-4">
                        <img
                          src="/alchemix-v2-react/images/icons/alcx_med.svg"
                          className="h-5 w-5"
                          alt="All transmuters filter"
                        />
                        <p>All Transmuters</p>
                      </TabsTrigger>
                      <TabsTrigger
                        value={SYNTH_ASSETS.ALUSD}
                        className="space-x-4"
                      >
                        <img
                          src="/alchemix-v2-react/images/icons/alusd_med.svg"
                          className="h-5 w-5"
                          alt="alUSD filter"
                        />
                        <p>alUSD</p>
                      </TabsTrigger>
                      <TabsTrigger
                        value={SYNTH_ASSETS.ALETH}
                        className="space-x-4"
                      >
                        <img
                          src="/alchemix-v2-react/images/icons/aleth_med.svg"
                          className="h-5 w-5"
                          alt="alETH filter"
                        />
                        <p>alETH</p>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </Tabs>
            </div>
            <Accordion type="single" collapsible className="space-y-4 p-4">
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
        </div>
      )}
    </>
  );
};
