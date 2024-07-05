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
            "w-full rounded-md border border-blue-50 transition-colors hover:ring-1 hover:ring-blue-100 focus:outline-none focus:ring-1 focus:ring-blue-100",
            value === option
              ? "ring-sankoBlue border-blue-200 bg-blue-100 ring-1"
              : "bg-blue-200",
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
            "border-sankoBlue/50 hover:ring-sankoBlue focus:ring-sankoBlue w-full rounded-md border transition-colors hover:ring-1 focus:outline-none focus:ring-1",
            value === option
              ? "bg-sankoBlue/50 ring-sankoBlue ring-1"
              : "bg-sankoBlue/10",
          )}
        >
          {option}%
        </button>
      ))}
    </div>
  );
};
