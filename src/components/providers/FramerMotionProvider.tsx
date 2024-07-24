import { LazyMotion, domAnimation } from "framer-motion";

// NOTE: Reduced bundle size,
// see: https://www.framer.com/motion/guide-reduce-bundle-size/

export const FramerMotionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
};
