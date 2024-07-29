import { Input } from "@/components/ui/input";
import { AmountQuickOptions } from "./InputQuickOptions";
import { decimalNumberValidationRegex } from "@/utils/inputValidation";
import { formatInput, sanitizeNumber } from "@/utils/number";

interface SlippageInputProps {
  slippage: string;
  setSlippage: (value: string) => void;
}

export const SlippageInput = ({
  slippage,
  setSlippage,
}: SlippageInputProps) => {
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumber(e.target.value, 2);
    setSlippage(sanitized);
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    if (formatted !== e.target.value) setSlippage(formatted);
  };
  return (
    <div className="flex flex-col">
      <p className="whitespace-nowrap text-sm text-lightgrey10inverse dark:text-lightgrey10">
        Maximum Slippage: {slippage}%
      </p>
      <div className="flex items-center gap-2">
        <AmountQuickOptions value={slippage} setValue={setSlippage} />
        <div className="relative">
          <Input
            type="text"
            inputMode="decimal"
            pattern={decimalNumberValidationRegex}
            value={slippage}
            onChange={onChange}
            onBlur={onBlur}
            className="w-16"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-lightgrey10inverse dark:text-lightgrey10">
            %
          </span>
        </div>
      </div>
    </div>
  );
};
