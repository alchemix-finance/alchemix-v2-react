import type { Transition, Variants } from "framer-motion";

export const accordionVariants = {
  open: { opacity: 1, height: "auto" },
  collapsed: { opacity: 0, height: 0 },
};

export const reducedMotionAccordionVariants = {
  open: { opacity: 1 },
  collapsed: { opacity: 0 },
} as const satisfies Variants;

export const accordionTransition = {
  duration: 0.2,
  ease: "easeOut",
} as const satisfies Transition;
