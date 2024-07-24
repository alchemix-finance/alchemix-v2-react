import { Input } from "@/components/ui/input";
import { AmountQuickOptions } from "./InputQuickOptions";

interface SlippageInputProps {
  slippage: string;
  setSlippage: (value: string) => void;
}

export const SlippageInput = ({
  slippage,
  setSlippage,
}: SlippageInputProps) => {
  return (
    <div className="flex flex-col">
      <p className="whitespace-nowrap text-sm text-lightgrey10inverse">
        Maximum Slippage: {slippage}%
      </p>
      <div className="flex items-center gap-2">
        <AmountQuickOptions value={slippage} setValue={setSlippage} />
        <div className="relative">
          <Input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="w-16"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-lightgrey10inverse">
            %
          </span>
        </div>
      </div>
    </div>
  );
};
