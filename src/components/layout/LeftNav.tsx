import { cn } from "@/utils/cn";
import { Link, useMatchRoute } from "@tanstack/react-router";

import { routeTitleToPathMapping } from "@/components/layout/Header";
import { useSentinel } from "@/lib/queries/sentinel/useSentinel";

export function LeftNav() {
  const matchRoute = useMatchRoute();
  const { data: isSentinel } = useSentinel();
  return (
    <nav className="mt-40 hidden flex-grow flex-col justify-start space-y-5 p-5 font-semibold md:flex">
      {Object.keys(routeTitleToPathMapping).map((item) => (
        <Link
          key={item}
          to={
            routeTitleToPathMapping[
              item as keyof typeof routeTitleToPathMapping
            ]
          }
          className={cn(
            "flex cursor-pointer justify-between rounded-xl bg-grey10inverse p-4 transition-opacity",
            "hover:opacity-100",
            matchRoute({
              to: routeTitleToPathMapping[
                item as keyof typeof routeTitleToPathMapping
              ],
              fuzzy: true,
            })
              ? "opacity-100"
              : "opacity-40",
          )}
        >
          {item}
        </Link>
      ))}
      {isSentinel && (
        <Link
          to="/sentinel"
          className={cn(
            "flex cursor-pointer justify-between rounded-xl bg-grey10inverse p-4 transition-opacity",
            "hover:opacity-100",
            matchRoute({
              to: "/sentinel",
            })
              ? "opacity-100"
              : "opacity-40",
          )}
        >
          Sentinel
        </Link>
      )}
    </nav>
  );
}
