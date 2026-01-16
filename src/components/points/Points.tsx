import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useConnection } from "wagmi";
import { Button } from "../ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import {
  accordionTransition,
  accordionVariants,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";

import { PointsLeaderboardTable } from "./PointsLeaderboardTable";
import { useUserPoints, useLeaderboard, getPointsBreakdown } from "./usePoints";
import { formatNumber } from "@/utils/number";
import { LoadingBar } from "../common/LoadingBar";

export const Points = () => {
  const [open, setOpen] = useState(false);
  const isReducedMotion = useReducedMotion();
  const { address } = useConnection();

  const { data: userPointsData, isLoading: isUserLoading } =
    useUserPoints(address);

  const { data: leaderboardData, isLoading: isLeaderboardLoading } =
    useLeaderboard();

  const userPoints = getPointsBreakdown(userPointsData);
  const leaderboard = leaderboardData ?? [];

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 relative w-full rounded-sm border">
        <div className="bg-grey10inverse dark:bg-grey10 flex h-20 w-full flex-col gap-2 px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <p className="text-sm">My Mana</p>
        </div>
        {isUserLoading ? (
          <div className="my-4 flex justify-center">
            <LoadingBar />
          </div>
        ) : (
          <div key="migrationPoints">
            <div className="flex w-full gap-8 space-y-4 p-4">
              <div className="flex w-[25%] flex-col items-center justify-between gap-8 p-4">
                <h2 className="text-2xl font-semibold">Total Mana</h2>
                <p className="text-5xl font-medium">
                  {formatNumber(userPoints.totalPoints)}
                </p>
                <div className="text-l flex justify-center gap-8 font-light">
                  <div className="flex items-center gap-2">
                    <div className="bg-grey2 size-3 rounded-full" />
                    <span>DM - {formatNumber(userPoints.depositPoints)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-bronze2 size-3 rounded-full" />
                    <span>MM - {formatNumber(userPoints.migrationPoints)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-bronze2inverse size-3 rounded-full" />
                    <span>LM - {formatNumber(userPoints.lpPoints)}</span>
                  </div>
                </div>
              </div>
              <div className="flex w-[75%] flex-col gap-4">
                <div className="border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3 flex flex-col gap-4 rounded-sm border p-4">
                  <h2 className="text-xl font-semibold">How to Earn?</h2>
                  <p>
                    Deposit Mana is earned by depositors having assets in
                    Alchemix vaults. Deposit Mana is temporary and leveled-up to
                    Migration Mana for users that remain deposited in Alchemix
                    during the migration period. New users can also earn Deposit
                    and Migration Mana by depositing into Alchemix V2 vaults at
                    any point prior to the V3 launch and allowing their
                    positions to be migrated. Users should only participate if
                    they wish to use Alchemix V3. Those that leave immediately
                    after migrating are at risk of losing their Deposit Mana.
                    Liquidity Mana can be earned by liquidity providers for
                    alAsset pools.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1">
                    <Link to="/vaults">Deposit in Vaults</Link>
                  </Button>
                  <Button className="flex-1">
                    <Link to="/farms">Provide Liquidity</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 relative w-full rounded-sm border">
        <div
          className="bg-grey10inverse dark:bg-grey10 flex items-center justify-between px-6 py-4 text-sm select-none hover:cursor-pointer"
          onClick={handleOpen}
        >
          <p className="text-sm">Leaderboard</p>
          <Button variant="action" className="hidden sm:inline-flex">
            {open ? (
              <EyeOffIcon className="h-6 w-6" />
            ) : (
              <EyeIcon className="h-6 w-6" />
            )}
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <m.div
              key="pointsLeaderboard"
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
              {isLeaderboardLoading ? (
                <div className="my-4 flex justify-center">
                  <LoadingBar />
                </div>
              ) : (
                <PointsLeaderboardTable data={leaderboard} />
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
