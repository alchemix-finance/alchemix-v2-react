import { useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";

import { Vault } from "@/lib/types";
import { useChain } from "@/hooks/useChain";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  MotionDirection,
  reducedMotionVariants,
  transition,
  variants,
} from "./motion";
import { AprHistoricalChart } from "./information/AprHistoricalChart";
import { Earned } from "./information/Earned";
import { HarvestsAndBonuses } from "./information/HarvestsAndBonuses";

interface VaultInfoProps {
  vault: Vault;
}

const TABS = ["apr", "harvests", "bonuses", "earned"] as const;
type Tab = (typeof TABS)[number];
const isTab = (tab: string): tab is Tab => TABS.includes(tab as Tab);

export const VaultInfo = ({ vault }: VaultInfoProps) => {
  const chain = useChain();

  const [tab, setTab] = useState<Tab>("apr");
  const [motionDirection, setMotionDirection] =
    useState<MotionDirection>("right");
  const isReducedMotion = useReducedMotion();

  const onTabChange = (newTab: string) => {
    if (newTab === tab) return;
    if (!isTab(newTab)) return;
    const indexOfCurrentAction = TABS.indexOf(tab);
    const indexOfNewAction = TABS.indexOf(newTab);
    if (indexOfNewAction > indexOfCurrentAction) {
      setMotionDirection("right");
    } else setMotionDirection("left");
    setTab(newTab);
  };

  return (
    <div className="flex w-full flex-col space-y-5 rounded-sm border border-grey1inverse md:w-1/3 dark:border-grey1">
      <div className="rounded-t border-b border-grey1inverse bg-grey3inverse p-2 dark:border-grey1 dark:bg-grey3">
        <Tabs value={tab} onValueChange={onTabChange}>
          <ScrollArea className="max-w-full">
            <div className="relative h-8 w-full">
              <TabsList className="absolute h-auto">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="h-8 w-full capitalize first:uppercase"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Tabs>
      </div>
      <ScrollArea className="h-36">
        <AnimatePresence
          initial={false}
          mode="popLayout"
          custom={motionDirection}
        >
          <m.div
            key={tab}
            variants={isReducedMotion ? reducedMotionVariants : variants}
            transition={transition}
            initial="enter"
            animate="center"
            exit="exit"
            custom={motionDirection}
            className="space-y-2 px-3"
          >
            {chain.id === 250 && <p>Not supported on {chain.name}</p>}

            {chain.id !== 250 && (tab == "harvests" || tab === "bonuses") && (
              <HarvestsAndBonuses vault={vault} tab={tab} />
            )}
            {chain.id !== 250 && tab === "apr" && (
              <AprHistoricalChart vault={vault} />
            )}
            {chain.id !== 250 && tab === "earned" && <Earned vault={vault} />}
          </m.div>
          <ScrollBar />
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
};
