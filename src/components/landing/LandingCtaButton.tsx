import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useInView } from "framer-motion";

import { cn } from "@/utils/cn";

export const LandingCtaButton = ({ delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <Link
      ref={ref}
      style={{
        transition: `opacity 1.1s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s, color 0.15s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
      to="/vaults"
      className={cn(
        // Base styles for the button
        "group relative inline-flex h-11 animate-buttonMovingGradientBg cursor-pointer items-center justify-center self-start rounded-xl border-0 px-4 py-5 font-sans text-xl font-bold tracking-tight text-[#0B0D12] transition-all",
        // Apply multiple background layers
        "bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
        // Background layers for the gradient effect
        "bg-[linear-gradient(#1BEAA5,#1BEAA5),linear-gradient(#1BEAA5,#1BEAA5),linear-gradient(90deg,#1BEAA5,#1BEAA5,#1BEAA5,#1BEAA5,#1BEAA5)]",
        // Animate in when in view
        isInView ? "opacity-100 blur-0" : "opacity-0 blur-sm",
        // Before pseudo-element for the glow effect
        // "before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:animate-buttonMovingGradientBg before:bg-[linear-gradient(90deg,#1EFFB4,#1BEAA5,#1EFFB4,#1BEAA5,#1EFFB4)] before:bg-[length:200%] before:opacity-70 before:[filter:blur(1rem)]",

        "",
      )}
    >
      <span className="relative z-10">GET A SELF-REPAYING LOAN</span>
    </Link>
  );
};
