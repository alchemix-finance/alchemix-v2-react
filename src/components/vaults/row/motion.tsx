import { Transition, Variants } from "framer-motion";

export type MotionDirection = "left" | "right";

export const variants = {
  enter: (direction: MotionDirection) => ({
    x: direction === "right" ? 90 : -90,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: MotionDirection) => ({
    x: direction === "right" ? -90 : 90,
    opacity: 0,
  }),
} as const satisfies Variants;

export const reducedMotionVariants = {
  enter: {
    opacity: 0,
  },
  center: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
} as const satisfies Variants;

export const transition = {
  type: "spring",
  duration: 0.4,
  bounce: 0,
} as const satisfies Transition;
