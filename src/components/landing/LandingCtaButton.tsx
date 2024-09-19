import { createLink } from "@tanstack/react-router";
import { m, type Variants } from "framer-motion";

const wrapperVariants = {
  initial: {
    opacity: 0,
    filter: "blur(10px)",
  },
  tap: { scale: 0.95 },
  animateIn: (delay) => ({
    opacity: 1,
    filter: "blur(0)",
    transition: { duration: 1.1, delay },
  }),
  applyShadow: (delay) => ({
    boxShadow: "10px 5px 12px #f5c09a",
    transition: { duration: 1.1, delay },
  }),
  hover: {
    boxShadow: "none",
  },
} as const satisfies Variants;

const MLink = createLink(m.a);

export const LandingCtaButton = ({ delay = 0 }: { delay?: number }) => {
  return (
    <MLink
      custom={delay}
      initial="initial"
      whileInView={["animateIn", "applyShadow"]}
      whileHover="hover"
      whileTap="tap"
      viewport={{ once: true }}
      variants={wrapperVariants}
      to="/vaults"
      className="relative inline-flex w-max items-center rounded-lg border border-lightgrey10inverse bg-bronze1 px-4 py-2 text-2xl font-bold tracking-wider text-black2 dark:border-lightgrey10"
    >
      Get your first Self-Repaying Loan
    </MLink>
  );
};
