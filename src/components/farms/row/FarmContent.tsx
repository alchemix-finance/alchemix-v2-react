import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChain } from "@/hooks/useChain";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { cn } from "@/utils/cn";
import { isInputZero } from "@/utils/inputNotZero";
import { decimalNumberValidationRegex } from "@/utils/inputValidation";
import { formatNumber, sanitizeNumber } from "@/utils/number";
import { erc20Abi, formatEther } from "viem";
import { useAccount, useReadContract } from "wagmi";

interface FarmProps {
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  poolTokenAddress: `0x${string}`;
  tokenSymbol: string;
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  withdrawBalance: string | undefined;
  isApprovalNeeded: boolean | undefined;
  onDeposit: () => void;
  onWithdraw: () => void;
  onClaim: () => void;
  isDisabled: boolean;
  rewards: { amount: string; symbol: string; tokenAddress: `0x${string}` }[];
}

export const FarmContent = ({
  depositAmount,
  setDepositAmount,
  poolTokenAddress,
  tokenSymbol,
  withdrawAmount,
  setWithdrawAmount,
  withdrawBalance,
  isApprovalNeeded,
  onDeposit,
  onWithdraw,
  onClaim,
  isDisabled,
  rewards,
}: FarmProps) => {
  const chain = useChain();
  const { address } = useAccount();
  const { data: balance, queryKey: balanceQueryKey } = useReadContract({
    address: poolTokenAddress,
    chainId: chain.id,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address!],
    query: {
      enabled: !!address,
      select: (balance) => formatEther(balance),
    },
  });

  useWatchQuery({
    queryKey: balanceQueryKey,
  });

  const onDepositChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumber(e.target.value, 18);
    setDepositAmount(sanitized);
  };

  const onWithdrawChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumber(e.target.value, 18);
    setWithdrawAmount(sanitized);
  };

  const handleMaxDeposit = () => {
    if (balance) {
      return setDepositAmount(balance);
    }
  };

  const handleClearDeposit = () => {
    setDepositAmount("");
  };

  const handleMaxWithdraw = () => {
    if (withdrawBalance) {
      return setWithdrawAmount(withdrawBalance);
    }
  };

  const handleClearWithdraw = () => {
    setWithdrawAmount("");
  };

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:gap-8 lg:py-4 lg:pl-8 lg:pr-4">
      <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4">
        <div className="space-y-4">
          <p className="text-xs font-light text-lightgrey10 lg:text-sm">
            Balance: {formatNumber(balance)} {tokenSymbol}
          </p>
          <div className="flex flex-col lg:flex-row">
            <div className="relative flex-grow">
              <Input
                type="text"
                inputMode="decimal"
                pattern={decimalNumberValidationRegex}
                value={depositAmount}
                className={cn(
                  "mb-2 h-full rounded-none p-4 text-right text-xl",
                  balance !== undefined &&
                    +depositAmount > +balance &&
                    "text-red-500 ring-2 ring-red-500 focus-visible:ring-red-500",
                )}
                placeholder="0.00"
                onChange={onDepositChange}
              />
            </div>
            <div className="flex lg:flex-col">
              <Button
                variant="action"
                weight="normal"
                className="h-10 w-full rounded-b-none rounded-l-none border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100"
                onClick={handleMaxDeposit}
              >
                MAX
              </Button>
              <Button
                variant="action"
                weight="normal"
                className="h-10 w-full rounded-l-none rounded-t-none border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100"
                onClick={handleClearDeposit}
              >
                CLEAR
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          disabled={isInputZero(depositAmount)}
          onClick={onDeposit}
        >
          {isApprovalNeeded ? "Approve" : "Deposit"}
        </Button>
      </div>
      <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4">
        <div className="space-y-4">
          <p className="text-xs font-light text-lightgrey10 lg:text-sm">
            Available: {formatNumber(withdrawBalance)} {tokenSymbol}
          </p>
          <div className="flex flex-col lg:flex-row">
            <div className="relative flex-grow">
              <Input
                type="text"
                inputMode="decimal"
                pattern={decimalNumberValidationRegex}
                value={withdrawAmount}
                className={cn(
                  "mb-2 h-full rounded-none p-4 text-right text-xl",
                  balance !== undefined &&
                    +withdrawAmount > +balance &&
                    "text-red-500 ring-2 ring-red-500 focus-visible:ring-red-500",
                )}
                placeholder="0.00"
                onChange={onWithdrawChange}
              />
            </div>
            <div className="flex lg:flex-col">
              <Button
                variant="action"
                weight="normal"
                className="h-10 w-full rounded-b-none rounded-l-none border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100"
                onClick={handleMaxWithdraw}
              >
                MAX
              </Button>
              <Button
                variant="action"
                weight="normal"
                className="h-10 w-full rounded-l-none rounded-t-none border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100"
                onClick={handleClearWithdraw}
              >
                CLEAR
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          disabled={
            isInputZero(withdrawAmount) ||
            +withdrawAmount > +(withdrawBalance ?? "0")
          }
          onClick={onWithdraw}
        >
          Withdraw
        </Button>
      </div>

      <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4">
        <p className="text-xs font-light text-lightgrey10 lg:text-sm">
          Rewards
        </p>
        <div className="flex rounded border border-grey3inverse bg-grey3inverse">
          {rewards.map((reward) => (
            <div
              key={reward.tokenAddress}
              className="h-full w-full appearance-none rounded bg-grey3inverse px-14 py-6 text-right text-xl"
            >
              {reward.amount} {reward.symbol}
            </div>
          ))}
        </div>
        <Button variant="outline" disabled={isDisabled} onClick={onClaim}>
          Claim
        </Button>
      </div>
    </div>
  );
};
