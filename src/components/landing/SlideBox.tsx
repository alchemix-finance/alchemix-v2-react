import { m, type Variants } from "framer-motion";

interface SlideBoxProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "bottom" | "right";
}

const variants = {
  left: {
    hidden: { x: "-20%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
  },
  bottom: {
    hidden: { y: "20%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
  },
  right: {
    hidden: { x: "20%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
  },
} as const satisfies Record<string, Variants>;

export const SlideBox = ({
  children,
  className,
  delay,
  direction = "bottom",
}: SlideBoxProps) => {
  return (
    <m.div
      initial="hidden"
      whileInView="animate"
      viewport={{ once: true, amount: 0.5 }}
      variants={variants[direction]}
      transition={{ duration: 1, delay }}
      className={className}
    >
      {children}
    </m.div>
  );
};
