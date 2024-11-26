import { HTMLAttributes, Ref, forwardRef } from "react";
import { useMatchRoute, createLink } from "@tanstack/react-router";
import { motion, MotionProps } from "framer-motion";

import { cn } from "@/utils/cn";
import {
  routeTitleToPathMapping,
  RouteTitle,
} from "@/components/layout/Header";
import { useSentinel } from "@/lib/queries/sentinel/useSentinel";

const MotionLinkForwardRef = forwardRef(
  (
    props: MotionProps & HTMLAttributes<HTMLAnchorElement>,
    ref: Ref<HTMLAnchorElement>,
  ) => {
    return <motion.a {...props} ref={ref} />;
  },
);
MotionLinkForwardRef.displayName = "MotionLinkForwardRef";

const MotionLink = createLink(MotionLinkForwardRef);

export function LeftNav() {
  const matchRoute = useMatchRoute();
  const { data: isSentinel } = useSentinel();
  return (
    <nav className="space-y-5">
      <p className="my-4 text-xs font-medium uppercase tracking-wider opacity-30">
        Navigation
      </p>
      {Object.keys(routeTitleToPathMapping).map((item) => (
        <MotionLink
          key={item}
          to={routeTitleToPathMapping[item as RouteTitle].to}
          className={cn(
            "relative flex cursor-pointer justify-between rounded-xl p-4 transition-all",
            "hover:opacity-100",
            matchRoute({
              to: routeTitleToPathMapping[item as RouteTitle].to,
              fuzzy: true,
            })
              ? "opacity-100"
              : "opacity-40",
          )}
        >
          {item}
          <img
            src={routeTitleToPathMapping[item as RouteTitle].icon}
            className="h-7 w-7 invert dark:filter-none"
            alt={`${item} icon`}
          />

          {matchRoute({
            to: routeTitleToPathMapping[item as RouteTitle].to,
            fuzzy: true,
          }) ? (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 -z-10 rounded-xl bg-grey10inverse dark:bg-grey10"
            />
          ) : null}
        </MotionLink>
      ))}
      {isSentinel && (
        <MotionLink
          to="/sentinel"
          className={cn(
            "relative flex cursor-pointer justify-between rounded-xl p-4 transition-all",
            "hover:opacity-100",
            matchRoute({
              to: "/sentinel",
              fuzzy: true,
            })
              ? "opacity-100"
              : "opacity-40",
          )}
        >
          Sentinel
          <img
            src="/images/icons/sentinel_med.svg"
            className="h-7 w-7 invert dark:filter-none"
            alt="Sentinel icon"
          />
          {matchRoute({
            to: "/sentinel",
            fuzzy: true,
          }) ? (
            <motion.div
              layoutId="tab-indicator"
              className="absolute inset-0 -z-10 rounded-xl bg-grey10inverse dark:bg-grey10"
            />
          ) : null}
        </MotionLink>
      )}
    </nav>
  );
}
