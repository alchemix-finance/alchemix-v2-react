import { m } from "framer-motion";

import { cn } from "@/utils/cn";

interface BlurInHeaderProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const variants = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  visible: { filter: "blur(0px)", opacity: 1 },
};

export const BlurInHeader = ({
  children,
  className,
  delay,
}: BlurInHeaderProps) => {
  return (
    <m.h1
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      transition={{ duration: 1, delay }}
      className={cn(className)}
    >
      {children}
    </m.h1>
  );
};
