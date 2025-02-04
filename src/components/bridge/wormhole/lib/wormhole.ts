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
import {
  SYNTHS_TO_XERC20_MAPPING,
  SYNTH_ASSETS_ADDRESSES,
} from "@/lib/config/synths";
import { isInputZero } from "@/utils/inputNotZero";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { useChain } from "@/hooks/useChain";
import { useAllowance } from "@/hooks/useAllowance";
import { getDestinationWormholeChainId, getSpender } from "./utils";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";
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
    SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD],
    SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH],
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

export const targetMapping: TargetMapping = {
  [mainnet.id]: {
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
      "0xA9e28396B4259B51444af21B2B80897920917360",
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
      "0x862A205494516e57D33b7F5182fC305E2B17Bc45",
    [SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]]:
      "0xA9e28396B4259B51444af21B2B80897920917360",
    [SYNTHS_TO_XERC20_MAPPING[SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]]:
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
  bridgeCost,
  updateBridgeTxHash,
}: {
  amount: string;
  originChainId: number;
  destinationChainId: number;
  originTokenAddress: `0x${string}`;
  decimals: number | undefined;
  setOriginTokenAddress: (address: `0x${string}`) => void;
  bridgeCost: string | undefined;
  updateBridgeTxHash: (amount: `0x${string}`) => void;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  const isWrapNeeded = Object.keys(SYNTHS_TO_XERC20_MAPPING).includes(
    originTokenAddress,
  );

  const {
    isApprovalNeeded,
    approveConfig,
    approve,
    isFetching: isFetchingAllowance,
    isPending: isPendingAllowance,
  } = useAllowance({
    amount,
    tokenAddress: originTokenAddress,
    spender: getSpender({ originChainId, originTokenAddress }),
    decimals,
  });

  const {
    data: bridgeConfig,
    error: bridgeError,
    isPending: isBridgeConfigPending,
  } = useSimulateContract({
    address: getSpender({ originChainId, originTokenAddress }),
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

  const {
    writeContract: bridge,
    data: bridgeTxHash,
    reset: resetBridge,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Bridge",
    }),
  });

  const { data: receipt } = useWaitForTransactionReceipt({
    hash: bridgeTxHash,
    chainId: chain.id,
  });

  useEffect(() => {
    if (receipt) {
      updateBridgeTxHash(receipt.transactionHash);
      resetBridge();
    }
  }, [receipt, resetBridge, updateBridgeTxHash]);

  const writeApprove = () => {
    approveConfig?.request && approve(approveConfig.request);
  };

  const writeBridge = () => {
    if (bridgeError) {
      toast.error("Bridge failed", {
        description: getToastErrorMessage({ error: bridgeError }),
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
    if (isWrapNeeded) return;

    if (isApprovalNeeded === false) {
      return isBridgeConfigPending;
    } else return isPendingAllowance || isFetchingAllowance;
  })();

  return {
    writeBridge,
    writeApprove,
    isApprovalNeeded,
    isWrapNeeded,
    bridgeTxHash,
    isPending,
  };
};
