import { m } from "framer-motion";

export const Step = ({
  number,
  title,
  src,
}: {
  number: string;
  title: string;
  src: string;
}) => {
  return (
    <m.div
      whileHover="hover"
      className="relative flex flex-col items-center justify-between gap-10"
    >
      <h5 className="inline-flex items-center gap-2">
        <span className="text-3xl font-semibold">{number}</span>
        <span className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
          {title}
        </span>
      </h5>
      <img
        alt="Step 1. Deposit Image"
        src={src}
        loading="lazy"
        className="h-96 w-96 transition-all hover:outline hover:outline-2 hover:outline-cyan-500"
      />

      <m.div
        initial={{ opacity: 0 }}
        variants={{
          hover: {
            opacity: 0.8,
            transition: { ease: "linear", duration: 0.2 },
          },
        }}
        className="pointer-events-none absolute -top-1/3 size-full rounded-full bg-cyan-500 blur-[128px]"
      />
    </m.div>
  );
};
