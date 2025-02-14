import { queryOptions } from "@tanstack/react-query";
import { UsePublicClientReturnType, useReadContract } from "wagmi";
import { encodeFunctionData, formatEther, parseEther, zeroAddress } from "viem";
import { fantom } from "viem/chains";

import { SupportedChainId, wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import {
  BridgeQuote,
  SupportedBridgeChainIds,
  chainIdToWormholeChainIdMapping,
  originToDestinationTokenAddressMapping,
  wormholeTargetMapping,
} from "./constants";
import { wormholeBridgeAdapterAbi } from "@/abi/wormholeBridgeAdapter";
import { SYNTHS_TO_XERC20_MAPPING } from "@/lib/config/synths";
import { isInputZero } from "@/utils/inputNotZero";
import {
  ALCX_ARBITRUM_ADDRESS,
  ALCX_MAINNET_ADDRESS,
  ALCX_OPTIMISM_ADDRESS,
  ONE_MINUTE_IN_MS,
} from "@/lib/constants";

const getIsAlcx = (originTokenAddress: `0x${string}`) =>
  [ALCX_ARBITRUM_ADDRESS, ALCX_MAINNET_ADDRESS, ALCX_OPTIMISM_ADDRESS].includes(
    originTokenAddress,
  );

export const getWormholeQuoteQueryOptions = ({
  originChainId,
  destinationChainId,
  originTokenAddress,
  amount,
  address,
  publicClient,
  bridgeLimit,
}: {
  originChainId: SupportedChainId;
  destinationChainId: SupportedBridgeChainIds;
  originTokenAddress: `0x${string}`;
  amount: string;
  address: `0x${string}`;
  publicClient: UsePublicClientReturnType<typeof wagmiConfig>;
  /** NOTE: We pass bridge limit from the useHook, instead of reading within queryFn,
   * because we need to read bridge limit on the destination chain, but we pass publicClient with origin chainId. */
  bridgeLimit: string | undefined;
}) =>
  queryOptions({
    queryKey: [
      "bridgeQuote",
      "wormhole",
      originChainId,
      publicClient,
      address,
      destinationChainId,
      bridgeLimit,
      originTokenAddress,
      amount,
    ],
    queryFn: async () => {
      if (originChainId === fantom.id) {
        throw new Error("Unsupported origin chain");
      }
      if (bridgeLimit === undefined) {
        throw new Error("Bridge limit not ready");
      }
      if (getIsAlcx(originTokenAddress)) {
        throw new Error("Wormhole doesn't support ALCX");
      }

      const isLimitExceeded = +bridgeLimit < +amount;

      const spender = wormholeTargetMapping[originChainId][originTokenAddress];

      const destinationWormholeChainId =
        chainIdToWormholeChainIdMapping[destinationChainId];

      const bridgeCost = await publicClient.readContract({
        address: spender,
        abi: wormholeBridgeAdapterAbi,
        functionName: "bridgeCost",
        args: [destinationWormholeChainId],
      });

      const bridgeCostFormatted = formatEther(bridgeCost);
      const fee = bridgeCostFormatted;
      const amountOut = amount;

      const isWrapNeeded = Object.keys(SYNTHS_TO_XERC20_MAPPING).includes(
        originTokenAddress,
      );

      const data = encodeFunctionData({
        abi: wormholeBridgeAdapterAbi,
        functionName: "bridge",
        args: [BigInt(destinationWormholeChainId), parseEther(amount), address],
      });

      const tx = {
        data,
        to: spender,
        value: bridgeCost,
        chainId: originChainId,
      };

      const quote = {
        amountOut,
        fee,
        provider: "Wormhole",
        bridgeCost: bridgeCostFormatted,
        tx,
        isWrapNeeded,
        isLimitExceeded,
      } as const satisfies BridgeQuote;

      return quote;
    },
    refetchInterval: ONE_MINUTE_IN_MS,
    enabled:
      originChainId !== fantom.id &&
      !isInputZero(amount) &&
      bridgeLimit !== undefined,
  });

export const useBridgeLimit = ({
  destinationChainId,
  originTokenAddress,
}: {
  destinationChainId: SupportedBridgeChainIds;
  originTokenAddress: `0x${string}`;
}) => {
  const xErc20Address = !getIsAlcx(originTokenAddress)
    ? originToDestinationTokenAddressMapping[originTokenAddress][
        destinationChainId
      ]
    : zeroAddress;
  return useReadContract({
    address: xErc20Address,
    abi: [
      {
        inputs: [{ internalType: "address", name: "adapter", type: "address" }],
        name: "mintingCurrentLimitOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "mintingCurrentLimitOf",
    args: [wormholeTargetMapping[destinationChainId][xErc20Address]],
    chainId: destinationChainId,
    query: {
      select: (limit) => formatEther(limit),
      enabled: !getIsAlcx(originTokenAddress),
    },
  });
};
