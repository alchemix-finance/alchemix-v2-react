import { useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract,
  useSwitchChain,
} from "wagmi";
import { formatUnits } from "viem";
import { arbitrum } from "viem/chains";
import { toast } from "sonner";

import { distributorAbi } from "@/abi/distributor";
import { CLAIMS, DISTRIBUTOR } from "@/lib/config/jUsdcDistribution";
import { formatNumber } from "@/utils/number";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";

import { CtaButton } from "./CtaButton";

export const JUsdcDistributionClaim = () => {
  const { address, chainId: connectedChainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const userClaim = CLAIMS.find(
    ({ address: userAddress }) =>
      userAddress.toLowerCase() === address?.toLowerCase(),
  );

  const { data: isClaimed, refetch: refetchIsClaimed } = useReadContract({
    address: DISTRIBUTOR,
    abi: distributorAbi,
    chainId: arbitrum.id,
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
    chainId: arbitrum.id,
    functionName: "claim",
    args: [
      BigInt(userClaim?.index ?? 0),
      address!,
      BigInt(userClaim?.amount ?? 0),
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
    if (connectedChainId !== arbitrum.id) {
      switchChain({
        chainId: arbitrum.id,
      });
    }

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
      <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 w-max rounded-sm border p-6">
        <h2 className="text-xl font-bold">jUSDC Recompensation</h2>

        <div className="text-center">
          <div className="text-green4 text-3xl font-bold">Claimed</div>
          <p className="text-lightgrey1">Distribution successfully claimed!</p>
        </div>

        <div className="text-lightgrey10 text-center text-xs">
          <p className="text-green4">Contract: {DISTRIBUTOR}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 w-max space-y-2 rounded-sm border p-6">
      <h2 className="text-center text-2xl">jUSDC Recompensation</h2>

      <div className="flex items-center justify-center gap-2 text-center">
        <p className="text-bronze3">Your allocation</p>
        <p className="font-medium">
          {formatNumber(formatUnits(BigInt(userClaim.amount), 6))} USDC
        </p>
      </div>

      <CtaButton
        variant="outline"
        width="full"
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
