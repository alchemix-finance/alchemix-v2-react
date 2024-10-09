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
        "group relative inline-flex h-11 animate-buttonMovingGradientBg cursor-pointer items-center justify-center rounded-xl border-0 px-8 py-2 text-xl font-extrabold tracking-normal text-black1 transition-all",
        // Apply multiple background layers
        "bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
        // Background layers for the gradient effect
        "bg-[linear-gradient(#F5C59F,#F5C59F),linear-gradient(#F5C59F_50%,rgba(245,197,159,0.6)_80%,rgba(245,197,159,0)),linear-gradient(90deg,#ff7eb9,#ff65a3,#7afcff,#feff9c,#fff740)]",
        // Animate in when in view
        isInView ? "opacity-100 blur-0" : "opacity-0 blur-sm",
        // Before pseudo-element for the glow effect
        "before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:animate-buttonMovingGradientBg before:bg-[linear-gradient(90deg,#ff7eb9,#ff65a3,#7afcff,#feff9c,#fff740)] before:bg-[length:200%] before:opacity-70 before:[filter:blur(1rem)]",
      )}
    >
      <span className="relative z-10">GET YOUR SELF-REPAYING LOAN</span>
    </Link>
  );
};
