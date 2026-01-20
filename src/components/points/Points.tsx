import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useConnection } from "wagmi";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  accordionTransition,
  accordionVariants,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";
import { formatNumber } from "@/utils/number";
import { LoadingBar } from "@/components/common/LoadingBar";

import { PointsLeaderboardTable } from "./PointsLeaderboardTable";
import { useUserPoints, useLeaderboard, useTotalPoints } from "./usePoints";

export const Points = () => {
  const isReducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);

  const { address } = useConnection();

  const { data: userPointsData, isPending: isUserPointsDataPending } =
    useUserPoints(address);

  const { data: totalPoints, isPending: isTotalPointsPending } =
    useTotalPoints();

  const { data: leaderboardData, isPending: isLeaderboardDataPending } =
    useLeaderboard();

  const userPercentage =
    totalPoints && userPointsData?.totalPoints
      ? (userPointsData.totalPoints / totalPoints) * 100
      : 0;

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const isLoading =
    (!!address && isUserPointsDataPending) || isTotalPointsPending;

  return (
    <div className="flex flex-col gap-8">
      <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 relative w-full rounded-sm border">
        <div className="bg-grey10inverse dark:bg-grey10 h-20 w-full px-6 py-4">
          <p className="text-sm">Mana Overview</p>
        </div>
        {isLoading ? (
          <div className="my-4 flex justify-center">
            <LoadingBar />
          </div>
        ) : (
          <div>
            <div className="flex w-full flex-col gap-8 p-4 md:flex-row">
              {/* Stats */}
              <div className="flex w-full flex-col p-4 lg:w-1/3">
                {/* Total Mana */}
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  <p className="text-bronze3 text-sm font-medium tracking-wider uppercase">
                    Total Mana
                  </p>
                  <p className="text-4xl font-semibold">
                    {formatNumber(totalPoints)}
                  </p>
                </div>
                <div className="border-grey10inverse dark:border-grey10 border-t" />
                {/* My Mana */}
                <div className="flex flex-1 flex-col items-center justify-center gap-2">
                  <p className="text-bronze3 text-sm font-medium tracking-wider uppercase">
                    My Mana
                  </p>
                  {address ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-semibold">
                          {formatNumber(userPointsData?.totalPoints)}
                        </p>
                        <span className="text-bronze2inverse dark:text-bronze2 text-lg">
                          (
                          {userPercentage.toFixed(
                            userPercentage < 0.01 ? 4 : 2,
                          )}
                          %)
                        </span>
                      </div>
                      <div className="mt-2 flex justify-center gap-4 text-sm font-light">
                        <div className="flex items-center gap-2">
                          <div className="bg-grey2 size-2.5 rounded-full" />
                          <span>
                            DM -{" "}
                            {formatNumber(userPointsData?.v2_deposits_points)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-bronze2inverse dark:bg-bronze2 size-2.5 rounded-full" />
                          <span>
                            LM - {formatNumber(userPointsData?.lp_points)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <p className="text-4xl font-semibold">
                          {formatNumber(userPointsData?.totalPoints)}
                        </p>
                        <span className="text-bronze2inverse dark:text-bronze2 text-lg">
                          (
                          {userPercentage.toFixed(
                            userPercentage < 0.01 ? 4 : 2,
                          )}
                          %)
                        </span>
                      </div>
                      <p className="text-grey5 text-sm">
                        Connect wallet to view your mana
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* How to Earn */}
              <div className="flex w-full flex-col gap-4 md:w-2/3">
                <div className="border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3 flex flex-col gap-4 rounded-sm border p-4">
                  <h2 className="text-xl font-semibold">How to Earn?</h2>
                  <p className="font-light">
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
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button variant="outline" className="w-full sm:flex-1">
                    <Link to="/vaults">Deposit in Vaults</Link>
                  </Button>
                  <Button variant="outline" className="w-full sm:flex-1">
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
              {isLeaderboardDataPending ? (
                <div className="my-4 flex justify-center">
                  <LoadingBar />
                </div>
              ) : (
                <PointsLeaderboardTable data={leaderboardData ?? []} />
              )}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
