import { cn } from "@/utils/cn";
import { Link, useMatchRoute } from "@tanstack/react-router";

import {
  routeTitleToPathMapping,
  RouteTitle,
} from "@/components/layout/Header";
import { useSentinel } from "@/lib/queries/sentinel/useSentinel";

export const MobileNav = () => {
  const matchRoute = useMatchRoute();
  const { data: sentinel } = useSentinel();
  return (
    <div className="bg-grey30inverse dark:bg-grey30 fixed bottom-0 z-10 flex w-full justify-between space-x-4 p-4 lg:hidden">
      {Object.keys(routeTitleToPathMapping).map((item) => (
        <Link
          key={item}
          to={routeTitleToPathMapping[item as RouteTitle].to}
          className={cn(
            "block cursor-pointer transition-all",
            matchRoute({
              to: routeTitleToPathMapping[item as RouteTitle].to,
              fuzzy: true,
            })
              ? "bg-grey10inverse dark:bg-grey10 opacity-100"
              : "opacity-40",
          )}
        >
          <img
            src={routeTitleToPathMapping[item as RouteTitle].icon}
            className="h-7 w-7 invert dark:filter-none"
            alt="vaults"
          />
        </Link>
      ))}
      {sentinel?.isSentinel && (
        <Link
          to="/sentinel"
          className={cn(
            "block cursor-pointer transition-all",
            matchRoute({
              to: "/sentinel",
              fuzzy: true,
            })
              ? "bg-grey10inverse dark:bg-grey10 opacity-100"
              : "opacity-40",
          )}
        >
          <img
            src="/images/icons/sentinel_med.svg"
            className="h-7 w-7 invert dark:filter-none"
            alt="vaults"
          />
        </Link>
      )}
    </div>
  );
};
