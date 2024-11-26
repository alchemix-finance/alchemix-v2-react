import { LazyMotion, domMax } from "framer-motion";

// NOTE: Possible to reduce bundle size,
// see: https://www.framer.com/motion/guide-reduce-bundle-size/

export const FramerMotionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <LazyMotion features={domMax}>{children}</LazyMotion>;
};
