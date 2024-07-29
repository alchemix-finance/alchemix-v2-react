import { cn } from "@/utils/cn";
import { Link, useMatchRoute } from "@tanstack/react-router";

import {
  routeTitleToPathMapping,
  RouteTitle,
} from "@/components/layout/Header";
import { useSentinel } from "@/lib/queries/sentinel/useSentinel";

export function LeftNav() {
  const matchRoute = useMatchRoute();
  const { data: isSentinel } = useSentinel();
  return (
    <nav className="space-y-5">
      <p className="my-4 text-xs font-medium uppercase tracking-wider opacity-30">
        Navigation
      </p>
      {Object.keys(routeTitleToPathMapping).map((item) => (
        <Link
          key={item}
          to={routeTitleToPathMapping[item as RouteTitle].to}
          className={cn(
            "flex cursor-pointer justify-between rounded-xl p-4 transition-all",
            "hover:bg-grey10inverse hover:opacity-100 dark:hover:bg-grey10",
            matchRoute({
              to: routeTitleToPathMapping[item as RouteTitle].to,
              fuzzy: true,
            })
              ? "bg-grey10inverse opacity-100 dark:bg-grey10"
              : "opacity-40",
          )}
        >
          {item}
          <img
            src={routeTitleToPathMapping[item as RouteTitle].icon}
            className="h-7 w-7 invert dark:filter-none"
            alt="vaults"
          />
        </Link>
      ))}
      {isSentinel && (
        <Link
          to="/sentinel"
          className={cn(
            "flex cursor-pointer justify-between rounded-xl p-4 transition-all",
            "hover:bg-grey10inverse hover:opacity-100 dark:hover:bg-grey10",
            matchRoute({
              to: "/sentinel",
              fuzzy: true,
            })
              ? "bg-grey10inverse opacity-100 dark:bg-grey10"
              : "opacity-40",
          )}
        >
          Sentinel
          <img
            src="/images/icons/sentinel_med.svg"
            className="h-7 w-7 invert dark:filter-none"
            alt="vaults"
          />
        </Link>
      )}
    </nav>
  );
}
