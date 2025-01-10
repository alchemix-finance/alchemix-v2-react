import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { useInView } from "framer-motion";

import { cn } from "@/utils/cn";

export const LandingSubButton = ({
  children,
  href,
  delay = 0,
}: {
  children: React.ReactNode;
  href?: string;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const Comp = !href ? Link : "a";

  return (
    <Comp
      ref={ref}
      style={{
        transition: `
    opacity 2s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s,
    color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
      to={href ? undefined : "/vaults"}
      href={href}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      className={cn(
        // Base styles for the button
        "group relative z-10 inline-flex h-10 cursor-pointer items-center justify-center rounded-xl px-8 py-5 font-sans text-lg tracking-tight text-iconsInverse dark:text-[#F3BF99]",
        // Apply multiple background layers
        "bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
        // Background layers for the gradient effect
        "bg-[linear-gradient(#E8E4DB,#E8E4DB),linear-gradient(#003e63,#003e63),linear-gradient(90deg,#F3BF99,#F3BF99,#F3BF99,#F3BF99,#F3BF99)] dark:bg-[linear-gradient(#0B0D12,#0B0D12),linear-gradient(#F3BF99,#F3BF99),linear-gradient(90deg,#F3BF99,#F3BF99,#F3BF99,#F3BF99,#F3BF99)]",
        // Animate in when in view
        isInView ? "opacity-100 blur-0" : "opacity-0 blur-sm",
        // Base styles for before pseudo-element
        "before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:animate-buttonMovingGradientBg before:bg-[linear-gradient(90deg,#E8E4DB,#F3BF99,#E8E4DB,#F3BF99,#E8E4DB)] before:bg-[length:200%] before:opacity-15 before:transition-opacity before:[filter:blur(1rem)] dark:before:bg-[linear-gradient(90deg,#080a0e,#F3BF99,#080a0e,#F3BF99,#080a0e)]",
        // Hover pseudo-element for the glow effect
        "hover:before:opacity-70",
      )}
    >
      <span className="relative z-10">{children}</span>
    </Comp>
  );
};

export const LandingCtaButton = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <Link
      ref={ref}
      style={{
        transition: `
    opacity 2s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s,
    color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)`,
      }}
      to="/vaults"
      className={cn(
        // Base styles for the button
        "group relative z-10 inline-flex h-11 cursor-pointer items-center justify-center rounded-xl border-0 px-8 py-5 font-sans text-lg font-medium tracking-tight text-[#1BEAA5] 2xl:text-xl",
        // Apply multiple background layers
        "bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
        // Background layers for the gradient effect
        "bg-[linear-gradient(#DEDBD3,#DEDBD3),linear-gradient(#1BEAA5,#1BEAA5),linear-gradient(90deg,#1BEAA5,#1BEAA5,#1BEAA5,#1BEAA5,#1BEAA5)] dark:bg-[linear-gradient(#080a0e,#080a0e),linear-gradient(#1BEAA5,#1BEAA5),linear-gradient(90deg,#1BEAA5,#1BEAA5,#1BEAA5,#1BEAA5,#1BEAA5)]",
        // Animate in when in view
        isInView ? "opacity-100 blur-0" : "opacity-0 blur-sm",
        // Base styles for before pseudo-element
        "before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:animate-buttonMovingGradientBg before:bg-[linear-gradient(90deg,#DEDBD3,#1BEAA5,#DEDBD3,#1BEAA5,#DEDBD3)] before:bg-[length:200%] before:opacity-15 before:transition-opacity before:[filter:blur(1rem)] dark:before:bg-[linear-gradient(90deg,#080a0e,#1BEAA5,#080a0e,#1BEAA5,#080a0e)]",
        // Hover pseudo-element for the glow effect
        "hover:before:animate-buttonMovingGradientBg hover:before:opacity-70",
      )}
    >
      <span className="relative z-10">{children}</span>
    </Link>
  );
};
