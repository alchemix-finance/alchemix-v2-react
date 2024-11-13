import { Variants } from "framer-motion";

export type MotionDirection = "left" | "right";

export const variants = {
  enter: (direction: MotionDirection) => ({
    x: direction === "right" ? 100 : -100,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: MotionDirection) => ({
    x: direction === "right" ? -100 : 100,
    opacity: 0,
  }),
} as const satisfies Variants;
