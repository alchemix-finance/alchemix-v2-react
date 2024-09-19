import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";

interface StepProps {
  src: string;
  /** We only use it for now before animations are ready */
  srcHover: string;
  alt: string;
}

/**
 * @deprecated
 * @description This component will be significantly changed when animations for steps are added.
 */
export const Step = ({ src, srcHover, alt }: StepProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <m.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {!isHovered && (
          <m.img
            key={alt}
            alt={alt}
            src={src}
            loading="lazy"
            className="aspect-square w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
        {isHovered && (
          <m.img
            key={alt + "hover"}
            alt={`${alt} hovered`}
            src={srcHover}
            className="aspect-square w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </m.div>
  );
};
