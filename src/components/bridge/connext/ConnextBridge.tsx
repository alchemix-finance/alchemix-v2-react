import { Button } from "@/components/ui/button";
import { accordionVariants, accordionTransition } from "@/lib/motion/motion";
import { AnimatePresence, m } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

export const ConnextBridge = () => {
  const [open, setOpen] = useState(true);
  const handleOpen = () => setOpen(!open);
  return (
    <div className="relative w-full rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
      <div
        className="flex select-none items-center justify-between bg-grey10inverse px-6 py-4 text-sm hover:cursor-pointer dark:bg-grey10"
        onClick={handleOpen}
      >
        <p className="text-sm">Connext Bridge</p>
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
            variants={accordionVariants}
            transition={accordionTransition}
          >
            <div className="flex flex-col gap-8 p-4"></div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
