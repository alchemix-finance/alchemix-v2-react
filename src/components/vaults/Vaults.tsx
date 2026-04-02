import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";

import { Accordion } from "@/components/ui/accordion";
import { useVaults } from "@/lib/queries/vaults/useVaults";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SYNTH_ASSETS, SynthAsset } from "@/lib/config/synths";
import { VaultsMetrics } from "@/components/vaults/VaultsMetrics";
import { ALCHEMISTS_METADATA } from "@/lib/config/alchemists";
import { useChain } from "@/hooks/useChain";
import { VaultAccordionRow } from "@/components/vaults/row/VaultAccordionRow";
import { Borrow } from "@/components/vaults/common_actions/Borrow";
import { Liquidate } from "@/components/vaults/common_actions/Liquidate";
import { Repay } from "@/components/vaults/common_actions/Repay";
import { LoadingBar } from "@/components/common/LoadingBar";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  accordionTransition,
  accordionVariants,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";
import { JUsdcDistributionClaim } from "@/components/common/JUsdcDistributionClaim";
import { VaultsMigrationNotice } from "@/components/vaults/VaultsMigrationNotice";

const IS_MIGRATION_IN_PROGRESS = true;

export type SynthFilter = "all" | SynthAsset;
type UsedFilter = "all" | "used" | "unused";
type Action = "Borrow" | "Repay" | "Liquidate";

export const Vaults = () => {
  const chain = useChain();

  const [synthTab, setSynthTab] = useState<SynthFilter>("all");
  const [usedTab, setUsedTab] = useState<UsedFilter>("all");
  const [actionOpened, setActionOpened] = useState(false);
  const [actionTab, setActionTab] = useState<Action>();
  const isReducedMotion = useReducedMotion();

  const { data: vaults, isPending, isSuccess, isError } = useVaults();

  const handleSynthTabChange = (tab: string) => {
    setSynthTab(tab as SynthFilter);
  };
  const handleUsedTabChange = (tab: string) => {
    setUsedTab(tab as UsedFilter);
  };
  const handleOpenAction = () => {
    setActionOpened((prev) => !prev);
    if (!actionTab && !actionOpened) setActionTab("Borrow");
  };
  const handleActionTabChange = (tab: Action) => {
    if (actionTab === tab) {
      if (actionOpened) {
        return setActionOpened(false);
      } else {
        return setActionOpened(true);
      }
    }
    setActionOpened(true);
    setActionTab(tab);
  };

  const filteredVaults = useMemo(() => {
    const onlyEnabledVaults = vaults?.filter(
      (vault) =>
        (vault.isLossGreaterThanMaxLoss !== true &&
          vault.yieldTokenParams.enabled !== false) ||
        vault.position.shares > 0,
    );
    const synthFiltered =
      synthTab === "all"
        ? onlyEnabledVaults
        : onlyEnabledVaults?.filter(
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

  if (IS_MIGRATION_IN_PROGRESS) {
    return <VaultsMigrationNotice />;
  }

  return (
    <>
      {isPending ? (
        <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 rounded-sm border">
          <div className="bg-grey10inverse dark:bg-grey10 flex space-x-4 px-6 py-4">
            <p className="inline-block self-center">Fetching data</p>
          </div>
          <div className="my-4 flex justify-center">
            <LoadingBar />
          </div>
        </div>
      ) : null}
      {isError && <div>Error. Unexpected. Contact Alchemix team.</div>}
      {isSuccess && (
        <div className="space-y-8">
          <JUsdcDistributionClaim />
          <div className="top-0 z-10 space-y-8 pt-4 drop-shadow-xl backdrop-blur-sm backdrop-filter md:sticky">
            <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 rounded-sm border">
              <Tabs value={synthTab} onValueChange={handleSynthTabChange}>
                <TabsList>
                  <TabsTrigger value="all" className="space-x-4">
                    <img
                      src="/images/icons/alcx_med.svg"
                      className="h-5 w-5"
                      alt="All vaults filter"
                    />
                    <p>All Vaults</p>
                  </TabsTrigger>
                  <TabsTrigger value={SYNTH_ASSETS.ALUSD} className="space-x-4">
                    <img
                      src="/images/icons/alusd_med.svg"
                      className="h-5 w-5"
                      alt="alUSD filter"
                    />
                    <p>alUSD</p>
                  </TabsTrigger>
                  <TabsTrigger value={SYNTH_ASSETS.ALETH} className="space-x-4">
                    <img
                      src="/images/icons/aleth_med.svg"
                      className="h-5 w-5"
                      alt="alETH filter"
                    />
                    <p>alETH</p>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="space-y-4">
              <VaultsMetrics
                filteredVaults={filteredVaults}
                selectedSynth={synthTab}
              />
              <div className="border-grey3inverse dark:border-grey3 rounded-sm border">
                <div className="bg-grey10inverse dark:bg-grey10 flex space-x-4 p-4">
                  <div className="flex grow flex-col gap-4 sm:flex-row">
                    {(
                      [
                        {
                          action: "Borrow",
                          iconUri: "/images/icons/Icon_Borrow.svg",
                        },
                        {
                          action: "Repay",
                          iconUri: "/images/icons/Icon_Repay.svg",
                        },
                        {
                          action: "Liquidate",
                          iconUri: "/images/icons/Icon_Liquidate.svg",
                        },
                      ] as const
                    ).map(({ action, iconUri }) => (
                      <Button
                        key={action}
                        width="full"
                        variant="action"
                        weight="normal"
                        data-state={
                          actionOpened && actionTab === action
                            ? "active"
                            : "inactive"
                        }
                        className="justify-start gap-4"
                        onClick={() => handleActionTabChange(action)}
                      >
                        <img
                          src={iconUri}
                          alt={action}
                          className="h-5 w-5 invert dark:filter-none"
                        />
                        {action}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="action"
                    onClick={handleOpenAction}
                    className="hidden sm:inline-flex"
                  >
                    {actionOpened ? (
                      <EyeOffIcon className="h-6 w-6" />
                    ) : (
                      <EyeIcon className="h-6 w-6" />
                    )}
                  </Button>
                </div>
                <AnimatePresence initial={false}>
                  {actionOpened && (
                    <m.div
                      key="actionContent"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={
                        isReducedMotion
                          ? reducedMotionAccordionVariants
                          : accordionVariants
                      }
                      transition={accordionTransition}
                    >
                      {actionTab === "Borrow" && <Borrow />}
                      {actionTab === "Repay" && <Repay />}
                      {actionTab === "Liquidate" && <Liquidate />}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 rounded-sm border">
            <div className="bg-grey10inverse dark:bg-grey10 px-6 py-4">
              <Tabs
                value={usedTab}
                onValueChange={handleUsedTabChange}
                className="w-full"
              >
                <ScrollArea className="max-w-full">
                  <div className="relative h-6 w-full">
                    <TabsList className="absolute h-auto">
                      <TabsTrigger value="used">Your Strategies</TabsTrigger>
                      <TabsTrigger value="all">All Strategies</TabsTrigger>
                      <TabsTrigger value="unused">
                        Unused Strategies
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </Tabs>
            </div>
            <Accordion type="single" collapsible className="space-y-4 p-4">
              {filteredVaults && filteredVaults.length > 0 ? (
                filteredVaults.map((vault) => (
                  <VaultAccordionRow key={vault.address} vault={vault} />
                ))
              ) : (
                <div>No vaults for selected chain and synth asset</div>
              )}
            </Accordion>
          </div>
        </div>
      )}
    </>
  );
};
