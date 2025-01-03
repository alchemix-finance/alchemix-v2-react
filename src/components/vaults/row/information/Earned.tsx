import { useAccount } from "wagmi";

import { Vault } from "@/lib/types";
import { useVaultEarned } from "@/lib/queries/vaults/useVaultEarned";
import { useHarvests } from "@/lib/queries/vaults/useHarvests";
import { formatNumber } from "@/utils/number";
import { LoadingBar } from "@/components/common/LoadingBar";
import { CtaButton } from "@/components/common/CtaButton";

export const Earned = ({ vault }: { vault: Vault }) => {
  const { address } = useAccount();

  const { data: harvestsAndBonuses, isPending: isPendingHarvestsAndBonuses } =
    useHarvests({ vault });

  const {
    data: generatedEarned,
    isLoading: isLoadingGeneratedEarned,
    refetch: generateEarned,
    isError,
  } = useVaultEarned({ vault, harvestsAndBonuses });

  const onGenerateEarned = () => {
    if (!address) return;
    if (!harvestsAndBonuses) return;

    generateEarned();
  };

  if (isPendingHarvestsAndBonuses) {
    return (
      <div className="flex h-36 items-center justify-center">
        <LoadingBar />
      </div>
    );
  }

  return (
    <div className="flex h-36 flex-col items-center justify-center gap-2">
      <p>
        {isError
          ? "Error. Please try again"
          : `${formatNumber(generatedEarned)} ${vault.alchemist.synthType}`}
      </p>
      <CtaButton
        variant="outline"
        size="sm"
        onClick={onGenerateEarned}
        disabled={isLoadingGeneratedEarned || !address}
      >
        {isLoadingGeneratedEarned ? "Loading..." : "Generate"}
      </CtaButton>
      <p className="text-lightgrey10">
        Please be patient. It may take up to 2 minutes to calculate the earned
        amount.
      </p>
    </div>
  );
};
