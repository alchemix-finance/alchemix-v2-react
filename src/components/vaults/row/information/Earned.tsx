import { useAccount } from "wagmi";

import { Vault } from "@/lib/types";
import { useVaultEarned } from "@/lib/queries/vaults/useVaultEarned";
import { formatNumber } from "@/utils/number";
import { LoadingBar } from "@/components/common/LoadingBar";

export const Earned = ({ vault }: { vault: Vault }) => {
  const { address } = useAccount();

  const {
    data: earned,
    isPending: isPendingEarned,
    isError,
  } = useVaultEarned({ vault });

  if (!address) {
    return (
      <div className="flex h-36 items-center justify-center">
        <p>Connect wallet</p>
      </div>
    );
  }

  if (isPendingEarned) {
    return (
      <div className="flex h-36 items-center justify-center">
        <LoadingBar />
      </div>
    );
  }

  return (
    <div className="flex h-36 items-center justify-center">
      <p>
        {isError
          ? "Error. Please try again"
          : `${formatNumber(earned)} ${vault.alchemist.synthType}`}
      </p>
    </div>
  );
};
