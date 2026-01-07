import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import {
  accordionTransition,
  accordionVariants,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";
import { PointsLeaderboardTable } from "./PointsLeaderboardTable";

/** TODO - replace constants with data reads later */
const DUMMY_LEADERBOARD = [
  { address: "0x1...", points: 10000 },
  { address: "0x2...", points: 9500 },
  { address: "0x3...", points: 10500 },
  { address: "0x4...", points: 9000 },
  { address: "0x5...", points: 8500 },
  { address: "0x6...", points: 8400 },
  { address: "0x7...", points: 8200 },
  { address: "0x8...", points: 7700 },
  { address: "0x9...", points: 7000 },
  { address: "0x10...", points: 5000 },
];

export const Points = () => {
  const [open, setOpen] = useState(false);
  const isReducedMotion = useReducedMotion();

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 relative w-full rounded-sm border">
        <div className="bg-grey10inverse dark:bg-grey10 flex h-20 w-full flex-col gap-2 px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <p className="text-sm">My Points</p>
        </div>
        <div key="migrationPoints">
          <div className="flex w-full gap-8 space-y-4 p-4">
            <div className="flex w-[25%] flex-col items-center justify-between gap-8 p-4">
              <h2 className="text-2xl font-semibold">Total Points</h2>
              <p className="text-4xl font-bold">4269</p>
              {/* TODO - replace with fetched value */}
              <div className="text-l flex justify-center gap-8 font-light">
                <div className="flex items-center gap-2">
                  <div className="bg-grey2 size-3 rounded-full" />
                  <span className="">DP - 4269</span>
                  {/* TODO - replace with fetched value */}
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-bronze2 size-3 rounded-full" />
                  <span>MP - 0</span>
                  {/* TODO - replace with fetched value */}
                </div>
              </div>
            </div>
            <div className="border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3 flex w-[75%] items-center gap-4 rounded-sm border">
              <div className="flex w-full flex-col gap-4 rounded-sm p-4">
                <h2 className="text-xl font-semibold">How to Earn?</h2>
                <p>
                  Deposit points reflect points already earned by depositors
                  into Alchemix vaults. Deposit Points are temporary and
                  converted to migration points for users that remain deposited
                  in Alchemix during the migration period. New users can also
                  earn migration points by depositing into Alchemix vaults prior
                  to V3 and allowing their positions to be migrated. Users
                  should only participate if they wish to use Alchemix V3. Those
                  that leave immediately after migrating are at risk of losing
                  their points.
                </p>
                <Button>
                  <Link to="/vaults">Deposit in Vaults</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
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
              <PointsLeaderboardTable data={DUMMY_LEADERBOARD} />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
