import { formatEther, parseEther } from "viem";
import { arbitrum, mainnet, optimism } from "viem/chains";
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { toast } from "sonner";

import { wormholeBridgeAdapterAbi } from "@/abi/wormholeBridgeAdapter";
import { SYNTH_ASSETS_ADDRESSES } from "@/lib/config/synths";
import { isInputZero } from "@/utils/inputNotZero";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { useChain } from "@/hooks/useChain";
import { useAllowance } from "@/hooks/useAllowance";
import { getDestinationWormholeChainId, getSpender } from "./utils";
import { lockboxAbi } from "@/abi/lockbox";
import { useEffect } from "react";

export const bridgeChains = [mainnet, optimism, arbitrum];
export type SupportedBridgeChainIds = (typeof bridgeChains)[number]["id"];

type AvailableTokensMapping = Record<SupportedBridgeChainIds, `0x${string}`[]>;
type TargetMapping = Record<
  SupportedBridgeChainIds,
  Record<`0x${string}`, `0x${string}`>
>;
type LockboxMapping = Record<`0x${string}`, `0x${string}`>;

export const chainIdToWormholeChainIdMapping = {
  [mainnet.id]: 2,
  [optimism.id]: 24,
  [arbitrum.id]: 23,
} as const;

export const chainToAvailableTokensMapping: AvailableTokensMapping = {
  [mainnet.id]: [
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
  ],

  [optimism.id]: [
    SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
  ],

  [arbitrum.id]: [
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
  ],
};

export const synthsToXErc20Mapping: Record<`0x${string}`, `0x${string}`> = {
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
    "0xe9D672f89493c7286A9BAfC6b763364EC0BFe4Fe",
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
    "0xab2e847b6bA3F772d385038e5b4fF131c161AB4B",
};

export const targetMapping: TargetMapping = {
  [mainnet.id]: {
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
      "0xA9e28396B4259B51444af21B2B80897920917360",
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
      "0x862A205494516e57D33b7F5182fC305E2B17Bc45",
  },
  [optimism.id]: {
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]:
      "0xa4158f90Cd65e6E5916BDCa9e3BfE70F511e36E1",
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]:
      "0x9B08D4d6c6a257a5aa2eb0c022B193deedD81CA4",
  },
  [arbitrum.id]: {
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH]:
      "0x07A4D78F8185354E58edcCf01cc0F6766ABD44DF",
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD]:
      "0x19bedE3d7Addf500eC6777384DD48A5715836c85",
  },
};

export const lockboxMapping: LockboxMapping = {
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
    "0x9141776017D6A8a8522f913fddFAcAe3e84a7CDb",
  [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
    "0x2930CDA830B206c84ae8d4CA3F77ec0eAA77a14b",
};

export const useBridgeCost = ({
  destinationChainId,
  originChainId,
  originTokenAddress,
}: {
  destinationChainId: number;
  originChainId: number;
  originTokenAddress: `0x${string}`;
}) => {
  return useReadContract({
    address: getSpender({
      originChainId,
      originTokenAddress,
      // Hardcoded to false, because we want to get adapter address anyhow
      isWrapNeeded: false,
    }),
    abi: wormholeBridgeAdapterAbi,
    functionName: "bridgeCost",
    args: [getDestinationWormholeChainId(destinationChainId)],
    chainId: originChainId,
    query: {
      select: (bridgeCost) => formatEther(bridgeCost),
    },
  });
};

export const useWormholeWriteBridge = ({
  amount,
  originChainId,
  destinationChainId,
  originTokenAddress,
  decimals,
  setOriginTokenAddress,
  bridgeCost,
}: {
  amount: string;
  originChainId: number;
  destinationChainId: number;
  originTokenAddress: `0x${string}`;
  decimals: number | undefined;
  setOriginTokenAddress: (address: `0x${string}`) => void;
  bridgeCost: string | undefined;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  const isWrapNeeded = false;

  const {
    isApprovalNeeded,
    approveConfig,
    approve,
    isFetching: isFetchingAllowance,
    isPending: isPendingAllowance,
  } = useAllowance({
    amount,
    tokenAddress: originTokenAddress,
    spender: getSpender({ originChainId, originTokenAddress, isWrapNeeded }),
    decimals,
  });

  const {
    data: wrapConfig,
    error: wrapError,
    isPending: isWrapConfigPending,
  } = useSimulateContract({
    address: getSpender({ originChainId, originTokenAddress, isWrapNeeded }),
    abi: lockboxAbi,
    functionName: "deposit",
    args: [parseEther(amount)],
    chainId: chain.id,
    query: {
      enabled: isWrapNeeded && !isInputZero(amount),
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

  const { data: wrapReceipt } = useWaitForTransactionReceipt({
    hash: wrapTxHash,
    chainId: chain.id,
  });

  useEffect(() => {
    if (wrapReceipt) {
      setOriginTokenAddress(synthsToXErc20Mapping[originTokenAddress]);
      resetWrap();
    }
  }, [setOriginTokenAddress, resetWrap, wrapReceipt, originTokenAddress]);

  const {
    data: bridgeConfig,
    error: bridgeError,
    isPending: isBridgeConfigPending,
  } = useSimulateContract({
    address: getSpender({ originChainId, originTokenAddress, isWrapNeeded }),
    abi: wormholeBridgeAdapterAbi,
    functionName: "bridge",
    args: [
      BigInt(getDestinationWormholeChainId(destinationChainId)),
      parseEther(amount),
      address!,
    ],
    value: parseEther(bridgeCost ?? "0"),
    chainId: chain.id,
    query: {
      enabled:
        !isInputZero(amount) &&
        !!address &&
        isApprovalNeeded === false &&
        isWrapNeeded === false &&
        bridgeCost !== undefined,
    },
  });

  const { writeContract: bridge, data: bridgeTxHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Bridge",
    }),
  });

  const writeApprove = () => {
    approveConfig?.request && approve(approveConfig.request);
  };

  const writeWrap = () => {
    if (wrapError) {
      toast.error("Wrap failed", {
        description:
          wrapError.name === "ContractFunctionExecutionError"
            ? wrapError.cause.message
            : wrapError.message,
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

  const writeBridge = () => {
    if (bridgeError) {
      toast.error("Bridge failed", {
        description:
          bridgeError.name === "ContractFunctionExecutionError"
            ? bridgeError.cause.message
            : bridgeError.message,
      });
      return;
    }
    if (bridgeConfig) {
      bridge(bridgeConfig.request);
    } else {
      toast.error("Bridge failed", {
        description: "Bridge unknown error. Please notify Alchemix team.",
      });
    }
  };

  const isPending = (() => {
    if (!amount) return;

    if (isApprovalNeeded === false) {
      return isWrapNeeded ? isWrapConfigPending : isBridgeConfigPending;
    } else return isPendingAllowance || isFetchingAllowance;
  })();

  return {
    writeBridge,
    writeApprove,
    writeWrap,
    isApprovalNeeded,
    isWrapNeeded,
    bridgeTxHash,
    isPending,
  };
};
