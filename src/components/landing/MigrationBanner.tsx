import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useAnimate } from "framer-motion";
import { ExternalLink, AlertTriangle, Clock } from "lucide-react";
import { useConnection } from "wagmi";

import { useUserPoints } from "@/components/points/usePoints";
import { formatNumber } from "@/utils/number";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

const MILLISECONDS_PER_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR;
const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * HOURS_PER_DAY;

const TARGET_DATE = new Date("2026-02-17T11:00:00-05:00"); // Feb 17, 11:00 AM EST

const GLITCH_VALUES = [
  "NaN",
  "??",
  "∞",
  "-1",
  "null",
  "ERR",
  "█▓",
  "--",
  "##",
] as const;

const NORMAL_HOLD = 2000; // how long normal value stays visible between glitches
const GLITCH_HOLD = 3000; // how long glitched value stays visible
const CHROMATIC_DURATION = 0.4; // chromatic animation duration in seconds

const GLITCH_SEQUENCE_DURATION = CHROMATIC_DURATION * 2 * 1000 + GLITCH_HOLD;
const GLITCH_INTERVAL = GLITCH_SEQUENCE_DURATION + NORMAL_HOLD;

const chromaticKeyframes = {
  textShadow: [
    "none",
    "-2px 0 #ff0000, 2px 0 #00ffff",
    "2px 0 #ff0000, -2px 0 #00ffff",
    "-1px 0 #ff0000, 1px 0 #00ffff",
    "none",
  ],
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const calculateTimeLeft = () => {
  const now = new Date();
  const difference = TARGET_DATE.getTime() - now.getTime();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / MILLISECONDS_PER_DAY),
    hours: Math.floor((difference / MILLISECONDS_PER_HOUR) % HOURS_PER_DAY),
    minutes: Math.floor(
      (difference / MILLISECONDS_PER_MINUTE) % MINUTES_PER_HOUR,
    ),
    seconds: Math.floor(
      (difference / MILLISECONDS_PER_SECOND) % SECONDS_PER_MINUTE,
    ),
  };
};

const TimeBlock = ({
  value,
  label,
  glitchValue,
}: {
  value: number;
  label: string;
  glitchValue: string | undefined;
}) => (
  <div className="flex flex-col items-center">
    <div
      data-timeblock
      className="border-bronze3 bg-bronze4inverse text-bronze1inverse dark:bg-bronze4 dark:text-bronze1 flex h-10 w-12 items-center justify-center rounded-md border-2 font-mono text-lg font-bold tabular-nums sm:h-12 sm:w-14 sm:text-xl"
    >
      {glitchValue ?? value.toString().padStart(2, "0")}
    </div>
    <span className="text-bronze1inverse dark:text-bronze3 mt-1 text-xs font-medium tracking-wider uppercase">
      {label}
    </span>
  </div>
);

const Separator = () => (
  <span className="text-bronze1inverse dark:text-bronze3 mx-1 self-start pt-1 text-2xl font-bold sm:pt-2 sm:text-3xl">
    :
  </span>
);

export const MigrationBanner = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);
  const [isExpired, setIsExpired] = useState(false);
  const [glitchValue, setGlitchValue] = useState<string>();

  const [scope, animate] = useAnimate();

  const { address } = useConnection();
  const { data: userPointsData } = useUserPoints(address);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      const isCountdownComplete =
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0;

      if (isCountdownComplete) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, MILLISECONDS_PER_SECOND);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isExpired) return;

    const runGlitchSequence = async () => {
      const value =
        GLITCH_VALUES[Math.floor(Math.random() * GLITCH_VALUES.length)];

      // Chromatic in (glitched value appears midway)
      const entryAnimation = animate("[data-timeblock]", chromaticKeyframes, {
        duration: CHROMATIC_DURATION,
        ease: "easeInOut",
      });
      await sleep(CHROMATIC_DURATION * 500);
      setGlitchValue(value);
      await entryAnimation;

      // Hold glitched value
      await sleep(GLITCH_HOLD);

      // Chromatic out (value clears midway)
      const exitAnimation = animate("[data-timeblock]", chromaticKeyframes, {
        duration: CHROMATIC_DURATION,
        ease: "easeInOut",
      });
      await sleep(CHROMATIC_DURATION * 500);
      setGlitchValue(undefined);
      await exitAnimation;
    };

    const glitchTimer = setInterval(runGlitchSequence, GLITCH_INTERVAL);
    return () => clearInterval(glitchTimer);
  }, [isExpired, animate]);

  return (
    <div className="border-bronze3/50 from-bronze4inverse to-bronze4inverse dark:from-bronze4 dark:to-bronze4 relative overflow-hidden border-b-2 bg-linear-to-r via-[#d4d0c8] dark:via-[#4a433d]">
      {/* Background shimmer */}
      <div className="animate-shimmer via-bronze1/10 absolute inset-0 -translate-x-full bg-linear-to-r from-transparent to-transparent" />

      {/* Background gradient */}
      <div className="from-bronze3/20 pointer-events-none absolute top-0 left-0 h-full w-48 bg-linear-to-r to-transparent" />
      <div className="from-bronze3/20 pointer-events-none absolute top-0 right-0 h-full w-48 bg-linear-to-l to-transparent" />

      <div className="relative flex flex-col items-center gap-4 px-4 py-4 sm:flex-row sm:gap-6 sm:px-8 lg:px-16 xl:px-24">
        {/* Announcement text */}
        <div className="flex flex-col items-center gap-2 sm:w-1/3 sm:items-start">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 animate-pulse text-orange-500 dark:text-orange-400" />
            <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs font-semibold tracking-wider text-orange-700 uppercase dark:bg-orange-400/20 dark:text-orange-300">
              Migration In Progress
            </span>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-alcxTitles text-bronze1inverse dark:text-bronze1 text-xl font-bold sm:text-2xl">
              V3 Migration Underway
            </h3>
            <p className="text-bronze1inverse/80 dark:text-bronze3 mt-1 max-w-xl text-sm leading-snug">
              Vault functions are temporarily disabled during migration.
              Deposits, withdrawals, and liquidations will resume once complete.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <a
              href="https://snapshot.box/#/s:alchemixstakers.eth/proposal/0xa3228100b34d6063dc03d35132c044a93ea1fbcce10a960bd43fb5a8454ec4b9"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bronze1inverse/10 text-bronze1inverse hover:bg-bronze1inverse/20 dark:bg-bronze1/10 dark:text-bronze1 dark:hover:bg-bronze1/20 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Migration Info
            </a>
            <a
              href="https://alchemixfi.medium.com/introducing-alchemix-v3-d55f86d35b49"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bronze1inverse/10 text-bronze1inverse hover:bg-bronze1inverse/20 dark:bg-bronze1/10 dark:text-bronze1 dark:hover:bg-bronze1/20 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              About V3
            </a>
          </div>
        </div>

        {/* User Points */}
        <Link
          to="/mana"
          className="flex flex-col items-center gap-4 transition-opacity hover:opacity-80 sm:w-1/3"
        >
          <span className="text-bronze1inverse dark:text-bronze3 text-xs font-medium tracking-wider uppercase">
            Your Mana
          </span>
          <span className="text-bronze1inverse dark:text-bronze1 text-4xl font-medium">
            {formatNumber(userPointsData?.totalPoints)}
          </span>
        </Link>

        {/* Countdown Timer */}
        <div ref={scope} className="flex flex-col items-center gap-2 sm:w-1/3">
          <div className="text-bronze1inverse dark:text-bronze3 flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
            <Clock className="h-3 w-3" />
            {isExpired ? "Migration Complete!" : "Est. Completion: Feb 17"}
          </div>

          <div className="flex items-center">
            <TimeBlock
              value={timeLeft.days}
              label="Days"
              glitchValue={glitchValue}
            />
            <Separator />
            <TimeBlock
              value={timeLeft.hours}
              label="Hrs"
              glitchValue={glitchValue}
            />
            <Separator />
            <TimeBlock
              value={timeLeft.minutes}
              label="Min"
              glitchValue={glitchValue}
            />
            <Separator />
            <TimeBlock
              value={timeLeft.seconds}
              label="Sec"
              glitchValue={glitchValue}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
};
