import { cn } from "@/utils/cn";

const percentOptions = ["25", "50", "75", "100"];
const amountOptions = ["0.2", "0.5", "1", "5"];

interface QuickOptionsProps {
  value: string;
  setValue: (value: string) => void;
}

interface PercentQuickOptionsProps extends QuickOptionsProps {
  percentOf: string | undefined;
}

export const AmountQuickOptions = ({ value, setValue }: QuickOptionsProps) => {
  return (
    <div className="flex items-center gap-1">
      {amountOptions.map((option) => (
        <button
          key={option}
          onClick={() => setValue(option)}
          className={cn(
            "w-full rounded-md border border-sankoBlue/50 transition-colors hover:ring-1 hover:ring-sankoBlue focus:outline-none focus:ring-1 focus:ring-sankoBlue",
            value === option
              ? "bg-sankoBlue/50 ring-1 ring-sankoBlue"
              : "bg-sankoBlue/10",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export const PercentQuickOptions = ({
  percentOf,
  value,
  setValue,
}: PercentQuickOptionsProps) => {
  const handleClick = (percent: string) => {
    const percentNumber = +percent;
    const percentOfNumber = +(percentOf ?? "0");
    const newValue = ((percentNumber / 100) * percentOfNumber).toFixed(18);
    setValue(newValue);
  };
  return (
    <div className="flex items-center gap-1">
      {percentOptions.map((option) => (
        <button
          key={option}
          onClick={() => handleClick(option)}
          className={cn(
            "w-full rounded-md border border-sankoBlue/50 transition-colors hover:ring-1 hover:ring-sankoBlue focus:outline-none focus:ring-1 focus:ring-sankoBlue",
            value === option
              ? "bg-sankoBlue/50 ring-1 ring-sankoBlue"
              : "bg-sankoBlue/10",
          )}
        >
          {option}%
        </button>
      ))}
    </div>
  );
};
