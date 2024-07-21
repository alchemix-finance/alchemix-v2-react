import { Accordion } from "@/components/ui/accordion";
import { useVaults } from "@/lib/queries/useVaults";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SYNTH_ASSETS, SynthAsset } from "@/lib/config/synths";
import { useMemo, useState } from "react";
import { VaultsMetrics } from "@/components/vaults/row/VaultsMetrics";
import { ALCHEMISTS_METADATA } from "@/lib/config/alchemists";
import { useChain } from "@/hooks/useChain";
import { VaultAccordionRow } from "@/components/vaults/row/VaultAccordionRow";
import { Borrow } from "@/components/vaults/common_actions/Borrow";
import { Liquidate } from "@/components/vaults/common_actions/Liquidate";
import { Repay } from "@/components/vaults/common_actions/Repay";
import { LoadingBar } from "../common/LoadingBar";

export const Vaults = () => {
  const chain = useChain();

  const [synthTab, setSynthTab] = useState<"all" | SynthAsset>("all");
  const [usedTab, setUsedTab] = useState<"all" | "used" | "unused">("all");
  const [actionTab, setActionTab] = useState<
    "borrow" | "repay" | "liquidate"
  >();

  const { data: vaults, isPending, isSuccess, isError } = useVaults();

  const onSynthTabChange = (tab: string) => {
    setSynthTab(tab as "all" | SynthAsset);
  };
  const onUsedTabChange = (tab: string) => {
    setUsedTab(tab as "all" | "used" | "unused");
  };
  const onActionTabChange = (tab: string) => {
    setActionTab(tab as "borrow" | "repay" | "liquidate");
  };

  const filteredVaults = useMemo(() => {
    const synthFiltered =
      synthTab === "all"
        ? vaults
        : [...(vaults ?? [])].filter(
            (vault) =>
              ALCHEMISTS_METADATA[chain.id][synthTab].toLowerCase() ===
              vault.alchemist.address.toLowerCase(),
          );
    if (usedTab === "all") return synthFiltered;
    if (usedTab === "used")
      return synthFiltered?.filter((vault) => vault.position.shares > 0n);
    if (usedTab === "unused")
      return synthFiltered?.filter((vault) => vault.position.shares === 0n);
  }, [chain.id, synthTab, usedTab, vaults]);

  return (
    <>
      {isPending ? (
        <div className="rounded border border-grey10inverse bg-grey15inverse">
          <div className="flex space-x-4 bg-grey10inverse px-6 py-4">
            <p className="inline-block self-center">Fetching data</p>
          </div>
          <div className="my-4 flex justify-center">
            <LoadingBar />
          </div>
        </div>
      ) : null}
      {isError && <div>Error. Unexpected. Contact Alchemix team.</div>}
      {isSuccess && (
        <div className="space-y-5">
          <Tabs value={synthTab} onValueChange={onSynthTabChange}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={SYNTH_ASSETS.ALETH}>AlETH</TabsTrigger>
              <TabsTrigger value={SYNTH_ASSETS.ALUSD}>AlUSD</TabsTrigger>
            </TabsList>
          </Tabs>
          <VaultsMetrics />
          <div className="rounded border p-5">
            <Tabs value={actionTab} onValueChange={onActionTabChange}>
              <TabsList>
                <TabsTrigger value="borrow">Borrow</TabsTrigger>
                <TabsTrigger value="repay">Repay</TabsTrigger>
                <TabsTrigger value="liquidate">Liquidate</TabsTrigger>
              </TabsList>
              <TabsContent value="borrow">
                <Borrow />
              </TabsContent>
              <TabsContent value="repay">
                <Repay />
              </TabsContent>
              <TabsContent value="liquidate">
                <Liquidate />
              </TabsContent>
            </Tabs>
          </div>
          <Tabs
            value={usedTab}
            onValueChange={onUsedTabChange}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="used">Your</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unused">Unused</TabsTrigger>
            </TabsList>
          </Tabs>
          <Accordion type="single" collapsible>
            {filteredVaults && filteredVaults.length > 0 ? (
              filteredVaults.map((vault) => (
                <VaultAccordionRow key={vault.address} vault={vault} />
              ))
            ) : (
              <div>No vaults for selected chain and synth asset</div>
            )}
          </Accordion>
        </div>
      )}
    </>
  );
};
