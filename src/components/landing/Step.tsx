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
    <div className="group relative flex flex-col items-center justify-between gap-10">
      <h3 className="inline-flex items-center gap-2">
        <span className="text-3xl font-semibold">{number}</span>
        <span className="text-xl text-lightgrey10inverse dark:text-lightgrey10">
          {title}
        </span>
      </h3>
      <img
        alt="Step 1. Deposit Image"
        src={src}
        loading="lazy"
        className="h-96 w-96 transition-all hover:outline hover:outline-2 hover:outline-cyan-500"
      />

      <div className="pointer-events-none absolute -top-1/3 size-full rounded-full bg-cyan-500 opacity-0 blur-[128px] transition-opacity duration-300 group-hover:opacity-80" />
    </div>
  );
};
