import { AnimatePresence, m, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const assets = [
  {
    name: "ETH",
    color: "#627EEA",
  },
  {
    name: "WSTETH",
    color: "#00A3FF",
  },
  {
    name: "RETH",
    color: "#ff0000",
  },
  {
    name: "DAI",
    color: "#f7b32b",
  },
  {
    name: "USDC",
    color: "#2775ca",
  },
  {
    name: "USDT",
    color: "#50af95",
  },
];

export const Tokens = () => {
  const container = useRef<HTMLDivElement>(null);

  const [hoveredIndex, setHoveredIndex] = useState<number>();

  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const isInView = useInView(container, {
    once: true,
    amount: 0.5,
  });

  useEffect(() => {
    if (hoveredIndex === undefined && isInView) {
      setHoveredIndex(0);
      return;
    }
  }, [hoveredIndex, isInView]);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        if (!isHovering) {
          setHoveredIndex((prevIndex) =>
            prevIndex === undefined ? 0 : (prevIndex + 1) % assets.length,
          );
        }
      }, 2000);
    };

    startInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering, isInView]);

  const onHoverStart = (index: number) => {
    setIsHovering(true);
    setHoveredIndex(index);
  };

  const onHoverEnd = () => {
    setIsHovering(false);
  };

  return (
    <div ref={container} className="flex items-center justify-between">
      {assets.map(({ name, color }, index) => (
        <m.div
          key={name}
          onHoverStart={() => onHoverStart(index)}
          onHoverEnd={onHoverEnd}
          initial={{ scale: 1, y: 0 }}
          whileHover={{ scale: 1.1, y: -10 }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
          className="relative"
        >
          <img
            alt={name}
            src={`/images/icons/${name.toLowerCase()}.svg`}
            className="h-20 w-20 rounded-full border border-lightgrey10inverse dark:border-lightgrey10"
          />

          <AnimatePresence initial={false}>
            {hoveredIndex === index && (
              <m.div
                key={name}
                layoutId="token-bg-blur"
                initial={{ opacity: 0 }}
                animate={{
                  background: color,
                  opacity: 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", duration: 1 }}
                className="absolute inset-0 left-0 top-0 -z-10 rounded-full blur-xl"
              />
            )}
          </AnimatePresence>
        </m.div>
      ))}
    </div>
  );
};
