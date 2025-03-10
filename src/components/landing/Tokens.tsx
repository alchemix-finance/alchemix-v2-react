import { m } from "framer-motion";

const ASSETS = [
  { name: "ETH", color: "#627EEA" },
  { name: "WSTETH", color: "#00A3FF" },
  { name: "RETH", color: "#ff0000" },
  { name: "APXETH", color: "#50af95" },
  { name: "DAI", color: "#f7b32b" },
  { name: "USDC", color: "#2775ca" },
  { name: "USDT", color: "#50af95" },
];

const ITEM_WIDTH = 128; // w-32
const GAP_WIDTH = 16; // gap-4
const ITEMS_IN_SET = ASSETS.length;
const FULL_SET_WIDTH = (ITEM_WIDTH + GAP_WIDTH) * ITEMS_IN_SET;

export const Tokens = () => {
  return (
    <div className="relative flex max-w-xs flex-col gap-8 sm:max-w-sm 2xl:max-w-lg">
      {/* Gradient Overlays */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-[16px] bg-linear-to-r from-[#f6f2ef] to-transparent dark:from-[#11141B]" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-[16px] bg-linear-to-l from-[#f6f2ef] to-transparent dark:from-[#11141B]" />

      {/* First Row - Right to Left */}
      <div className="relative flex w-full overflow-x-clip">
        <m.div
          className="flex gap-4 py-2"
          animate={{
            translateX: [0, -FULL_SET_WIDTH],
          }}
          transition={{
            duration: 60,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              {ASSETS.map(({ name }) => (
                <div
                  key={`${name}-${i}`}
                  className="flex h-32 w-32 items-center justify-center rounded-lg"
                >
                  <img
                    src={`/images/landing-page/${name.toLowerCase()}.png`}
                    alt={`${name} logo`}
                    className="aspect-square size-full object-cover"
                  />
                </div>
              ))}
            </div>
          ))}
        </m.div>
      </div>

      {/* Second Row - Left to Right */}
      <div className="relative flex w-full overflow-x-clip">
        <m.div
          className="flex gap-4 py-2"
          animate={{
            translateX: [-FULL_SET_WIDTH, 0],
          }}
          transition={{
            duration: 60,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-4">
              {[...ASSETS].reverse().map(({ name }) => (
                <div
                  key={`${name}-${i}`}
                  className="flex h-32 w-32 items-center justify-center rounded-lg"
                >
                  <img
                    src={`/images/landing-page/${name.toLowerCase()}.png`}
                    alt={`${name} logo`}
                    className="aspect-square size-full object-cover"
                  />
                </div>
              ))}
            </div>
          ))}
        </m.div>
      </div>
    </div>
  );
};
