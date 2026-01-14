import { useState, useEffect } from "react";
import { ExternalLink, Sparkles, Clock } from "lucide-react";

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

const TARGET_DATE = new Date("2026-02-06T11:00:00-05:00"); // Feb 6, 11:00 AM EST

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

const TimeBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="border-bronze3 bg-bronze4 text-bronze1 flex h-14 w-16 items-center justify-center rounded-md border-2 font-mono text-3xl font-bold tabular-nums sm:h-20 sm:w-24 sm:text-5xl">
      {value.toString().padStart(2, "0")}
    </div>
    <span className="text-bronze3 mt-2 text-xs font-medium tracking-wider uppercase sm:text-sm">
      {label}
    </span>
  </div>
);

const Separator = () => (
  <span className="text-bronze3 mx-1 self-start pt-3 text-3xl font-bold sm:mx-2 sm:pt-5 sm:text-5xl">
    :
  </span>
);

export const MigrationBanner = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft);
  const [isExpired, setIsExpired] = useState(false);

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

  return (
    <div className="border-bronze3/50 from-bronze4 to-bronze4 relative overflow-hidden border-b-2 bg-gradient-to-r via-[#4a433d]">
      {/* Background shimmer */}
      <div className="animate-shimmer via-bronze1/10 absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent to-transparent" />

      {/* Background gradient */}
      <div className="from-bronze3/20 pointer-events-none absolute top-0 left-0 h-full w-48 bg-gradient-to-r to-transparent" />
      <div className="from-bronze3/20 pointer-events-none absolute top-0 right-0 h-full w-48 bg-gradient-to-l to-transparent" />

      <div className="relative flex flex-col items-center gap-6 px-4 py-6 sm:flex-row sm:justify-between sm:gap-8 sm:px-8 lg:px-16 xl:px-24">
        {/* Announcement text */}
        <div className="flex flex-1 flex-col items-center gap-4 sm:items-start">
          <div className="flex items-center gap-2">
            <Sparkles className="text-bronze1 h-5 w-5 animate-pulse" />
            <span className="bg-bronze1/20 text-bronze1 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase">
              Important Update
            </span>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-alcxTitles text-bronze1 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Alchemix V3 Migration & MANA Program
            </h3>
            <p className="text-bronze3 mt-2 max-w-xl text-sm leading-relaxed sm:text-base">
              We&apos;re upgrading to V3! Deposits into V2 vaults will be
              automatically migrated into V3 vaults. Depositors in V2 are now
              accruing MANA to earn a share of future rewards, and become the
              first depositors in the V3 system.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            <a
              href="https://snapshot.box/#/s:alchemixstakers.eth/proposal/0xa3228100b34d6063dc03d35132c044a93ea1fbcce10a960bd43fb5a8454ec4b9" // TODO - Replace with migration plan article
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bronze1/10 text-bronze1 hover:bg-bronze1/20 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Learn About The Migration
            </a>
            <a
              href="https://alchemixfi.medium.com/introducing-alchemix-v3-d55f86d35b49"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-bronze1/10 text-bronze1 hover:bg-bronze1/20 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Learn About V3
            </a>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex flex-col items-center gap-3">
          <div className="text-bronze3 flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
            <Clock className="h-4 w-4" />
            {isExpired ? "Migration is Complete!" : "Migration Is Live"}
          </div>

          <div className="flex items-center">
            <TimeBlock value={timeLeft.days} label="Days" />
            <Separator />
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <Separator />
            <TimeBlock value={timeLeft.minutes} label="Min" />
            <Separator />
            <TimeBlock value={timeLeft.seconds} label="Sec" />
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
