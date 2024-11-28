import { LazyMotion } from "framer-motion";

// NOTE: Reduced initial bundle size.
// Lazy load rest of the Framer Motion features after the initial render.
// See: https://motion.dev/docs/react-reduce-bundle-size

// Make sure to return the specific export containing the feature bundle.
const loadFeatures = () =>
  import("framer-motion").then((module) => module.domMax);

export const FramerMotionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
};
