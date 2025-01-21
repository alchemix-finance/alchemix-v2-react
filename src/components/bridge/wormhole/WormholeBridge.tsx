import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Suspense, lazy, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  accordionVariants,
  accordionTransition,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";
import { BridgeFallback } from "../BridgeFallback";

const WormholeBridgeWidget = lazy(() =>
  import("./WormholeBridgeWidget").then((module) => ({
    default: module.WormholeBridgeWidget,
  })),
);

export const WormholeBridge = () => {
  const [open, setOpen] = useState(false);
  const isReducedMotion = useReducedMotion();
  const handleOpen = () => setOpen(!open);
  return (
    <div className="relative w-full rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
      <div
        className="flex select-none items-center justify-between bg-grey10inverse px-6 py-4 text-sm hover:cursor-pointer dark:bg-grey10"
        onClick={handleOpen}
      >
        <p className="text-sm">Wormhole Bridge</p>
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
            key="connextBridgeWidget"
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
            <div className="p-5">
              <Suspense fallback={<BridgeFallback />}>
                <WormholeBridgeWidget />
              </Suspense>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
