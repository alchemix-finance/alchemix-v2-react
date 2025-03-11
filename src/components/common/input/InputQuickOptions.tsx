import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const percentOptions = ["25", "50", "75", "100"];
const amountOptions = ["0.5", "1", "2", "5"];

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
        <Button
          key={option}
          variant="action"
          size="sm"
          weight="normal"
          data-state={value === option ? "active" : "inactive"}
          onClick={() => setValue(option)}
          className="w-10 sm:w-16"
        >
          {option}
        </Button>
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
            "border-sankoBlue/50 hover:ring-sankoBlue focus:ring-sankoBlue w-full rounded-md border transition-colors hover:ring-1 focus:outline-hidden focus:ring-1",
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
