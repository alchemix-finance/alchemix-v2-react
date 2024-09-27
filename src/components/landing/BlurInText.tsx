import { useRef } from "react";
import { useInView } from "framer-motion";

import { cn } from "@/utils/cn";

interface BlurInProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const BlurInHeader = ({ children, className, delay }: BlurInProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <h1
      ref={ref}
      style={{
        transitionDelay: `${delay}s`,
      }}
      className={cn(
        "transition-all duration-1000",
        isInView ? "blur(0px) opacity-100" : "blur(10px) opacity-0",
        className,
      )}
    >
      {children}
    </h1>
  );
};

export const BlurInParagraph = ({
  children,
  className,
  delay,
}: BlurInProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <p
      ref={ref}
      style={{
        transitionDelay: `${delay}s`,
      }}
      className={cn(
        "transition-all [transition-duration:1.1s]",
        isInView ? "blur(0px) opacity-100" : "blur(10px) opacity-0",
        className,
      )}
    >
      {children}
    </p>
  );
};
