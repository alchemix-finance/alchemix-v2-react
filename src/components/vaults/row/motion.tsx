import { m } from "framer-motion";

// TODO: use `custom` and direction to define where to enter from and exit tp
const variants = {
  enter: {
    x: -100,
    opacity: 0,
  },
  center: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: 100,
    opacity: 0,
  },
};

export const VaultActionMotionDiv = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <m.div
      className="mt-2"
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
    >
      {children}
    </m.div>
  );
};
