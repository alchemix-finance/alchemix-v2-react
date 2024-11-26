import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { AnimatePresence, LazyMotion, domMax, m } from "framer-motion";

import { cn } from "@/utils/cn";

let actions = [
  {
    name: "Deposit",
  },
  {
    name: "Borrow",
  },
  {
    name: "Withdraw",
  },
  {
    name: "Liquidate",
  },
];

actions = Array.from({ length: 3 }, () => actions).flat();

const Action = ({ name }: { name: string }) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-64 overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm sm:text-lg">{name}</span>
          </figcaption>
        </div>
      </div>
    </figure>
  );
};

const AnimatedList = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    const [index, setIndex] = useState(0);
    const childrenArray = React.Children.toArray(children);

    useEffect(() => {
      const interval = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % childrenArray.length);
      }, 2000);

      return () => clearInterval(interval);
    }, [childrenArray.length]);

    const itemsToShow = useMemo(
      () => childrenArray.slice(0, index + 1).reverse(),
      [index, childrenArray],
    );

    return (
      <LazyMotion features={domMax}>
        <div className="flex flex-col items-center gap-4">
          <AnimatePresence>
            {itemsToShow.map((item) => (
              <m.div
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, originY: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 40,
                  delay: 1,
                }}
                className="mx-auto w-full"
                key={(item as ReactElement).key}
              >
                {item}
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </LazyMotion>
    );
  },
);

AnimatedList.displayName = "AnimatedList";

export const ActionsList = ({
  color = "#F7C19B",
}: {
  color?: string | string[];
}) => {
  return (
    <div className="relative flex aspect-video h-52 w-full flex-col overflow-hidden rounded-lg bg-bodyGradient p-6 dark:bg-bodyGradientInverse">
      <div
        style={
          {
            "--mask-linear-gradient": `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
            "--background-radial-gradient": `radial-gradient(transparent,transparent, ${color instanceof Array ? color.join(",") : color},transparent,transparent)`,
          } as React.CSSProperties
        }
        className="motion-safe:before:animate-shine before:pointer-events-none before:absolute before:inset-0 before:z-10 before:size-full before:rounded-lg before:p-[2px] before:will-change-[background-position] before:content-[''] before:![-webkit-mask-composite:xor] before:[background-image:--background-radial-gradient] before:[background-size:300%_300%] before:![mask-composite:exclude] before:[mask:--mask-linear-gradient]"
      />
      <AnimatedList>
        {actions.map((item, idx) => (
          <Action {...item} key={idx} />
        ))}
      </AnimatedList>
    </div>
  );
};
