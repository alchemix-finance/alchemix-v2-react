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
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { VaultActionMotionDiv } from "./motion";

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

  const { data: tokens } = useTokensQuery();
  const tokenOfSelectedVault = tokens?.find((t) =>
    selectedVault.metadata.yieldTokenOverride
      ? t.address.toLowerCase() ===
        selectedVault.metadata.yieldTokenOverride.toLowerCase()
      : t.address.toLowerCase() === selectedVault.yieldToken.toLowerCase(),
  );

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
    <VaultActionMotionDiv>
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
                    src={`/images/token-icons/${tokenOfSelectedVault?.symbol}.svg`}
                    alt={tokenOfSelectedVault?.symbol}
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
        <Button
          variant="outline"
          width="full"
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
    </VaultActionMotionDiv>
  );
};
