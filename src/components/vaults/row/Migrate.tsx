import { useMemo, useState } from "react";
import { optimism } from "viem/chains";
import { formatUnits } from "viem";
import { divide, multiply, toString } from "dnum";

import { Vault } from "@/lib/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { MigrateTokenInput } from "@/components/common/input/MigrateTokenInput";
import { CtaButton } from "@/components/common/CtaButton";
import { SlippageInput } from "@/components/common/input/SlippageInput";
import { useChain } from "@/hooks/useChain";
import { useMigrate } from "@/lib/mutations/useMigrate";
import { isInputZero } from "@/utils/inputNotZero";
import { formatNumber } from "@/utils/number";

export const Migrate = ({
  vault,
  selection,
}: {
  vault: Vault;
  selection: Vault[];
}) => {
  const chain = useChain();

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const [selectedVaultAddress, setSelectedVaultAddress] = useState(
    selection[0].address,
  );

  const selectedVault = useMemo(() => {
    return selection.find((v) => v.address === selectedVaultAddress)!;
  }, [selectedVaultAddress, selection]);

  const {
    isApprovalNeededWithdraw,
    isApprovalNeededMint,
    writeWithdrawApprove,
    writeMintApprove,
    writeMigrate,
    isPending,
    minOrNewUnderlying,
  } = useMigrate({
    currentVault: vault,
    amount,
    setAmount,
    selectedVault,
    slippage,
  });

  const onCtaClick = () => {
    if (isApprovalNeededWithdraw === true) {
      writeWithdrawApprove();
      return;
    }
    if (isApprovalNeededMint === true) {
      writeMintApprove();
      return;
    }
    writeMigrate();
  };

  const ltv =
    vault.alchemist.totalValue > 0
      ? toString(
          multiply(
            divide(
              [vault.alchemist.position.debt, 18],
              [vault.alchemist.totalValue, 18],
            ),
            100,
          ),
        )
      : "0";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <p className="text-sm text-lightgrey10">Target Vault</p>
        <Select
          value={selectedVaultAddress}
          onValueChange={(value) =>
            setSelectedVaultAddress(value as `0x${string}`)
          }
        >
          <SelectTrigger className="w-24 sm:w-56">
            <SelectValue placeholder="Vault" asChild>
              <div className="flex items-center gap-4">
                <img
                  src={`/images/token-icons/${selectedVault.metadata.image}`}
                  alt={`${selectedVault.metadata.yieldSymbol} icon`}
                  className="hidden h-4 w-4 sm:block"
                />
                {selectedVault.metadata.label}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {selection.map((possibleVault) => (
              <SelectItem
                key={possibleVault.address}
                value={possibleVault.address}
              >
                {possibleVault.metadata.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
        <div className="flex items-center py-4 pl-4 pr-2">
          <img
            src="/images/token-icons/Shares.svg"
            alt="Shares icon"
            className="h-12 w-12"
          />
        </div>
        <MigrateTokenInput
          amount={amount}
          setAmount={setAmount}
          vault={vault}
        />
      </div>
      {chain.id === optimism.id ? (
        <SlippageInput slippage={slippage} setSlippage={setSlippage} />
      ) : (
        <p className="text-sm text-lightgrey10inverse dark:text-lightgrey10">
          Minimum underlying after migration:{" "}
          {formatNumber(
            formatUnits(
              minOrNewUnderlying ?? 0n,
              selectedVault.underlyingTokensParams.decimals,
            ),
          )}{" "}
          {selectedVault.metadata.underlyingSymbol}
        </p>
      )}
      <p className="text-sm text-lightgrey10inverse dark:text-lightgrey10">
        If you have no available credit in the respective Alchemist, trying to
        migrate will likely result in a failed transaction. Your current LTV for
        this Alchemist is {formatNumber(ltv)}%
      </p>
      <CtaButton
        variant="outline"
        width="full"
        disabled={isPending || isInputZero(amount)}
        onClick={onCtaClick}
      >
        {isPending
          ? "Preparing"
          : isApprovalNeededWithdraw === true
            ? "Approve Withdrawal"
            : isApprovalNeededMint === true
              ? "Approve Mint"
              : "Migrate"}
      </CtaButton>
    </div>
  );
};
