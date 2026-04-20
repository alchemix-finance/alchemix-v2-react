import { Link } from "@tanstack/react-router";
import { ExternalLink, CheckCircle2, ArrowRight } from "lucide-react";
import { useConnection } from "wagmi";

import { useUserPoints } from "@/components/points/usePoints";
import { formatNumber } from "@/utils/number";

export const MigrationBanner = () => {
  const { address } = useConnection();
  const { data: userPointsData } = useUserPoints(address);

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
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold tracking-wider text-green-700 uppercase dark:bg-green-400/20 dark:text-green-300">
              Migration Complete
            </span>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="font-alcxTitles text-bronze1inverse dark:text-bronze1 text-xl font-bold sm:text-2xl">
              Alchemix V3 is Live
            </h3>
            <p className="text-bronze1inverse/80 dark:text-bronze3 mt-1 max-w-xl text-sm leading-snug">
              The migration to V3 is complete. Head over to alchemix.fi to
              access the new vaults and continue self-repaying loans.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <a
              href="https://alchemix.fi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Launch Alchemix V3 (opens in new tab)"
              className="bg-bronze1inverse text-bronze4inverse hover:bg-bronze1inverse/90 dark:bg-bronze1 dark:text-bronze4 dark:hover:bg-bronze1/90 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
            >
              Launch v3
              <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </a>
            <a
              href="https://alchemixfi.medium.com/introducing-alchemix-v3-d55f86d35b49"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="About V3 (opens in new tab)"
              className="bg-bronze1inverse/10 text-bronze1inverse hover:bg-bronze1inverse/20 dark:bg-bronze1/10 dark:text-bronze1 dark:hover:bg-bronze1/20 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors"
            >
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
              About v3
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

        {/* V3 CTA */}
        <a
          href="https://alchemix.fi"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Continue to Alchemix V3 (opens in new tab)"
          className="border-bronze3 bg-bronze4inverse/50 hover:bg-bronze4inverse dark:bg-bronze4/50 dark:hover:bg-bronze4 group flex flex-col items-center gap-2 rounded-md border-2 px-6 py-4 transition-colors sm:w-1/3"
        >
          <span className="text-bronze1inverse dark:text-bronze3 text-xs font-medium tracking-wider uppercase">
            Continue on
          </span>
          <span className="text-bronze1inverse dark:text-bronze1 font-alcxTitles flex items-center gap-2 text-2xl font-bold">
            Alchemix v3
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </span>
        </a>
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
