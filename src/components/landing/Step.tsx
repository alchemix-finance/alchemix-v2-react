interface StepProps {
  src: string;
  /** We only use it for now before animations are ready */
  srcHover: string;
}

/**
 * @deprecated
 * @description This component will be significantly changed when animations for steps are added.
 */
export const Step = ({ src, srcHover }: StepProps) => {
  return (
    <div className="group relative flex flex-col items-center justify-between gap-10">
      <img
        alt="Step 1. Deposit Image"
        src={src}
        loading="lazy"
        className="h-96 w-96 transition-all hover:outline hover:outline-2 hover:outline-cyan-500"
      />
    </div>
  );
};
