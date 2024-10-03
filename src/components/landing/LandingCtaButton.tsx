import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useInView } from "framer-motion";

import { cn } from "@/utils/cn";

export const LandingCtaButton = ({ delay = 0 }: { delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <Link
      ref={ref}
      style={{
        transition: `opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, colors 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
      to="/vaults"
      className={cn(
        // base styles
        "relative inline-flex w-max select-none items-center rounded-xl border-0 px-7 py-2 text-2xl font-black tracking-wide focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 dark:focus-visible:ring-neutral-300",

        // animate in when in view
        isInView ? "blur(0px) opacity-100" : "blur(10px) opacity-0",

        // bg animation
        "bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",

        // before styles
        "before:pointer-events-none before:absolute before:bottom-[-40%] before:left-1/2 before:z-0 before:h-2/5 before:w-5/6 before:-translate-x-1/2 before:animate-buttonMovingGradientBg before:bg-gradient-to-r before:from-bronze2 before:via-bronze3 before:to-bronze1 before:bg-[length:200%] before:transition-colors before:[filter:blur(calc(0.8*1rem))] before:hover:[animation-play-state:paused]",

        "bg-[linear-gradient(#F5C59F,#F5C59F),linear-gradient(#F5C59F_50%,#F5C59F_80%,rgba(18,18,19,0)),linear-gradient(to_right,#F7C19B,#ad937c,#F5C59F)]",
      )}
    >
      <span className="text-black1">GET YOUR FIRST SELF-REPAYING LOAN</span>
    </Link>
  );
};
