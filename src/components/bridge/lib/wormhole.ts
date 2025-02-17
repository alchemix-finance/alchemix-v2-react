import { queryOptions } from "@tanstack/react-query";
import { UsePublicClientReturnType } from "wagmi";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import { fantom, linea, metis } from "viem/chains";

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
  originPublicClient,
  destinationPublicClient,
}: {
  originChainId: SupportedChainId;
  destinationChainId: SupportedBridgeChainIds;
  originTokenAddress: `0x${string}`;
  amount: string;
  address: `0x${string}`;
  originPublicClient: UsePublicClientReturnType<typeof wagmiConfig>;
  destinationPublicClient: UsePublicClientReturnType<typeof wagmiConfig>;
}) =>
  queryOptions({
    queryKey: [
      "bridgeQuote",
      "wormhole",
      originChainId,
      originPublicClient,
      destinationPublicClient,
      address,
      destinationChainId,
      originTokenAddress,
      amount,
    ],
    queryFn: async () => {
      if (
        originChainId === linea.id ||
        originChainId === metis.id ||
        originChainId === fantom.id
      ) {
        throw new Error("Unsupported origin chain");
      }
      if (destinationChainId === linea.id || destinationChainId === metis.id) {
        throw new Error("Unsupported destination chain");
      }
      if (getIsAlcx(originTokenAddress)) {
        throw new Error("Wormhole doesn't support ALCX");
      }

      const xErc20Address =
        originToDestinationTokenAddressMapping[originTokenAddress][
          destinationChainId
        ];

      const bridgeLimit = await destinationPublicClient.readContract({
        address: xErc20Address,
        abi: [
          {
            inputs: [
              { internalType: "address", name: "adapter", type: "address" },
            ],
            name: "mintingCurrentLimitOf",
            outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "mintingCurrentLimitOf",
        args: [wormholeTargetMapping[destinationChainId][xErc20Address]],
      });
      const bridgeLimitFormatted = formatEther(bridgeLimit);

      const isLimitExceeded = +bridgeLimitFormatted < +amount;

      const spender = wormholeTargetMapping[originChainId][originTokenAddress];

      const destinationWormholeChainId =
        chainIdToWormholeChainIdMapping[destinationChainId];

      const bridgeCost = await originPublicClient.readContract({
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
      !isInputZero(amount) &&
      originChainId !== fantom.id &&
      originChainId !== linea.id &&
      originChainId !== metis.id &&
      destinationChainId !== linea.id &&
      destinationChainId !== metis.id &&
      !getIsAlcx(originTokenAddress),
  });
