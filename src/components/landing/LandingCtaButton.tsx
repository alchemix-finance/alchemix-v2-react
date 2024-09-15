import { Link } from "@tanstack/react-router";
import { m, type Variants } from "framer-motion";

const variants = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0)" },
} as const satisfies Variants;

export const LandingCtaButton = ({ delay }: { delay?: number }) => {
  return (
    <m.div
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={variants}
      transition={{ duration: 1.1, delay }}
    >
      <Link
        to="/vaults"
        className="block w-max rounded-lg border-2 border-orange4 bg-bronze1 px-4 py-2 text-xl font-bold tracking-wider text-black2 shadow-glow transition-all hover:shadow-hoveredGlow"
      >
        Get your first Self-Repaying Loan
      </Link>
    </m.div>
  );
};
