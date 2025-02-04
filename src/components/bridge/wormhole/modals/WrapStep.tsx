import { useEffect } from "react";
import { toast } from "sonner";
import {
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { CircleCheckIcon, CircleIcon } from "lucide-react";
import { parseEther } from "viem";

import { lockboxMapping } from "@/components/bridge/wormhole/lib/wormhole";
import { lockboxAbi } from "@/abi/lockbox";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { isInputZero } from "@/utils/inputNotZero";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";
import { useAllowance } from "@/hooks/useAllowance";
import { useChain } from "@/hooks/useChain";
import { CtaButton } from "@/components/common/CtaButton";

export const WrapStep = ({
  originTokenAddress,
  amount,
  setBridgeStep,
  isActive,
}: {
  originTokenAddress: `0x${string}`;
  amount: string;
  setBridgeStep: () => void;
  isActive: boolean;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const {
    approve,
    approveConfig,
    isApprovalNeeded,
    isFetching: isFetchingAllowance,
    isPending: isPendingAllowance,
    isLoadingApprovalReceipt,
  } = useAllowance({
    amount,
    tokenAddress: originTokenAddress,
    spender: lockboxMapping[originTokenAddress],
    decimals: 18,
  });

  const {
    data: wrapConfig,
    error: wrapError,
    isPending: isWrapConfigPending,
  } = useSimulateContract({
    address: lockboxMapping[originTokenAddress],
    abi: lockboxAbi,
    functionName: "deposit",
    args: [parseEther(amount)],
    chainId: chain.id,
    query: {
      enabled: !isInputZero(amount) && isApprovalNeeded === false,
    },
  });

  const {
    writeContract: wrap,
    data: wrapTxHash,
    reset: resetWrap,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Wrap",
    }),
  });

  const { data: wrapReceipt, isLoading: isLoadingWrapReceipt } =
    useWaitForTransactionReceipt({
      hash: wrapTxHash,
      chainId: chain.id,
    });

  useEffect(() => {
    if (wrapReceipt) {
      resetWrap();
      setBridgeStep();
    }
  }, [setBridgeStep, resetWrap, wrapReceipt]);

  const writeApprove = () => {
    approveConfig && approve(approveConfig.request);
  };

  const writeWrap = () => {
    if (wrapError) {
      toast.error("Wrap failed", {
        description: getToastErrorMessage({ error: wrapError }),
      });
      return;
    }
    if (wrapConfig) {
      wrap(wrapConfig.request);
    } else {
      toast.error("Wrap failed", {
        description: "Wrap unknown error. Please notify Alchemix team.",
      });
    }
  };

  const onCtaClick = () => {
    if (isApprovalNeeded) {
      writeApprove();
    } else {
      writeWrap();
    }
  };

  const isPreparing = (() => {
    if (!amount) return;

    if (isApprovalNeeded === false) {
      return isWrapConfigPending;
    } else return isPendingAllowance || isFetchingAllowance;
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 leading-8">
          {isApprovalNeeded === false ? (
            <CircleCheckIcon className="h-4 w-4" />
          ) : (
            <CircleIcon className="h-4 w-4" />
          )}
          <span>Approve wrap</span>
        </h2>
        {isApprovalNeeded && isActive && (
          <CtaButton
            size="sm"
            variant="outline"
            weight="normal"
            className="w-1/3 text-base"
            disabled={
              isPreparing || isInputZero(amount) || isLoadingApprovalReceipt
            }
            onClick={onCtaClick}
          >
            {isPreparing ? "Preparing" : "Approve"}
          </CtaButton>
        )}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 leading-8">
          {isApprovalNeeded === false && !isActive ? (
            <CircleCheckIcon className="h-4 w-4" />
          ) : (
            <CircleIcon className="h-4 w-4" />
          )}
          <span>Wrap to bridge</span>
        </h2>
        {isApprovalNeeded === false && isActive && (
          <CtaButton
            size="sm"
            variant="outline"
            weight="normal"
            className="w-1/3 text-base"
            disabled={
              isPreparing || isInputZero(amount) || isLoadingWrapReceipt
            }
            onClick={onCtaClick}
          >
            {isPreparing ? "Preparing" : "Wrap"}
          </CtaButton>
        )}
      </div>
    </div>
  );
};
