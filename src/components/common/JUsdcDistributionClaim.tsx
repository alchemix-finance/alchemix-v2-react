import { useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
} from "wagmi";
import { parseUnits } from "viem";
import { toast } from "sonner";

import { distributorAbi } from "@/abi/distributor";
import { CLAIMS, DISTRIBUTOR } from "@/lib/config/jUsdcDistribution";
import { formatNumber } from "@/utils/number";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";

import { CtaButton } from "./CtaButton";

export const JUsdcDistributionClaim = () => {
  const { address } = useAccount();

  const userClaim = CLAIMS.find(
    ({ address: userAddress }) =>
      userAddress.toLowerCase() === address?.toLowerCase(),
  );

  const { data: isClaimed, refetch: refetchIsClaimed } = useReadContract({
    address: DISTRIBUTOR,
    abi: distributorAbi,
    functionName: "isClaimed",
    args: [BigInt(userClaim?.index ?? 0)],
    query: {
      enabled: !!userClaim,
    },
  });

  const {
    data: claimConfig,
    isPending: isPendingClaimConfig,
    error: claimConfigError,
  } = useSimulateContract({
    address: DISTRIBUTOR,
    abi: distributorAbi,
    functionName: "claim",
    args: [
      BigInt(userClaim?.index ?? 0),
      address!,
      parseUnits(userClaim?.amount ?? "0", 6),
      userClaim?.proof ?? [],
    ],
    query: {
      enabled: !!userClaim && isClaimed === false,
    },
  });

  const { writeContract: claim, data: claimHash } = useWriteContract();

  const { data: claimReceipt, isLoading: isClaimProcessing } =
    useWaitForTransactionReceipt({
      hash: claimHash,
    });

  useEffect(() => {
    if (claimReceipt && claimReceipt.status === "success") {
      refetchIsClaimed();
    }
  }, [claimReceipt, refetchIsClaimed]);

  const onCtaClick = () => {
    if (claimConfigError) {
      toast.error("Claim failed", {
        description: getToastErrorMessage({ error: claimConfigError }),
      });
      return;
    }
    if (claimConfig) {
      claim(claimConfig.request);
    } else {
      toast.error("Claim failed", {
        description: "Unknown error occurred. Please contact Alchemix team.",
      });
    }
  };

  if (!userClaim) {
    return null;
  }

  if (isClaimed) {
    return (
      <div className="bg-grey10inverse dark:bg-grey10 border-bronze3 w-full rounded-lg border p-6">
        <div className="mb-6 text-center">
          <h2 className="text-bronze1 mb-2 text-xl font-bold">
            jUSDC Recompensation
          </h2>
        </div>

        <div className="mb-6 text-center">
          <div className="text-green4 mb-2 text-3xl font-bold">✅ Claimed</div>
          <p className="text-lightgrey1">Distribution successfully claimed!</p>
        </div>

        <div className="text-lightgrey10 mt-4 text-center text-xs">
          <p className="text-green4">Contract: {DISTRIBUTOR}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-grey10inverse dark:bg-grey10 border-bronze3 w-full rounded-lg border p-6">
      <div className="mb-6 text-center">
        <h2 className="text-bronze1 mb-2 text-xl font-bold">
          jUSDC Recompensation
        </h2>
      </div>

      <div className="mb-6 text-center">
        <p className="text-lightgrey1">Your allocation</p>
        <div className="text-bronze2 mb-2 text-3xl font-bold">
          {formatNumber(userClaim.amount)} USDC
        </div>
      </div>

      <CtaButton
        variant="outline"
        onClick={onCtaClick}
        disabled={isPendingClaimConfig || isClaimProcessing}
      >
        {isPendingClaimConfig
          ? "Preparing..."
          : isClaimProcessing
            ? "Processing..."
            : "Claim"}
      </CtaButton>
    </div>
  );
};
