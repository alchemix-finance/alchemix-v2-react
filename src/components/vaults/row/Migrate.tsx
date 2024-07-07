import { Vault } from "@/lib/types";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useState } from "react";
import { useMigrate } from "@/lib/mutations/useMigrate";
import { MigrateTokenInput } from "@/components/common/input/MigrateTokenInput";
import { isInputZero } from "@/utils/inputNotZero";

export const Migrate = ({
  vault,
  selection,
}: {
  vault: Vault;
  selection: Vault[];
}) => {
  const [amount, setAmount] = useState("");

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
    isFetching,
  } = useMigrate({
    currentVault: vault,
    amount,
    setAmount,
    selectedVault,
  });

  const onCtaClick = useCallback(() => {
    if (isApprovalNeededWithdraw === true) {
      writeWithdrawApprove();
      return;
    }
    if (isApprovalNeededMint === true) {
      writeMintApprove();
      return;
    }
    writeMigrate();
  }, [
    isApprovalNeededMint,
    isApprovalNeededWithdraw,
    writeMigrate,
    writeMintApprove,
    writeWithdrawApprove,
  ]);

  return (
    <div className="space-y-2">
      <Select
        value={selectedVaultAddress}
        onValueChange={(value) =>
          setSelectedVaultAddress(value as `0x${string}`)
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Vault">
            {selectedVault.metadata.label}
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
      <MigrateTokenInput amount={amount} setAmount={setAmount} vault={vault} />
      <Button
        variant="outline"
        disabled={isFetching || isInputZero(amount)}
        onClick={onCtaClick}
      >
        {isFetching
          ? "Preparing"
          : isApprovalNeededWithdraw === true
            ? "Approve Withdrawal"
            : isApprovalNeededMint === true
              ? "Approve Mint"
              : "Migrate"}
      </Button>
    </div>
  );
};
