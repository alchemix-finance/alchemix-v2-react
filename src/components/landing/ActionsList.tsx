import { AnimatedList } from "@/components/ui/animated-list";
import { cn } from "@/utils/cn";

let actions = [
  {
    name: "Deposit",
    description: "Deposited wstETH",
  },
  {
    name: "Borrow",
    description: "Borrowed alETH",
  },
  {
    name: "Withdraw",
    description: "Withdrew wstETH",
  },
  {
    name: "Liquidate",
    description: "Liquidated alETH",
  },
];

actions = Array.from({ length: 10 }, () => actions).flat();

const Action = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => {
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
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export const ActionsList = () => {
  return (
    <div className="flex h-64 w-full flex-col overflow-hidden rounded-lg border border-bronze2 p-6">
      <AnimatedList delay={2000}>
        {actions.map((item, idx) => (
          <Action {...item} key={idx} />
        ))}
      </AnimatedList>
    </div>
  );
};
