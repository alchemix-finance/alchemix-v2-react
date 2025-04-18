import { queryOptions } from "@tanstack/react-query";
import { UsePublicClientReturnType } from "wagmi";
import { encodeFunctionData, erc20Abi, formatEther, parseEther } from "viem";
import { fantom, linea, mainnet, metis } from "viem/chains";

import { SupportedChainId, wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import {
  BridgeQuote,
  SupportedBridgeChainIds,
  chainIdToWormholeChainIdMapping,
  lockboxMapping,
  originToDestinationXTokenAddressMapping,
  originToDestinationAlAssetTokenAddressMapping,
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
import { QueryKeys } from "@/lib/queries/queriesSchema";

const getIsAlcx = (originTokenAddress: `0x${string}`) =>
  [ALCX_ARBITRUM_ADDRESS, ALCX_MAINNET_ADDRESS, ALCX_OPTIMISM_ADDRESS].includes(
    originTokenAddress,
  );

export const getWormholeQuoteQueryOptions = ({
  originChainId,
  destinationChainId,
  originTokenAddress,
  amount,
  receipient,
  originPublicClient,
  destinationPublicClient,
}: {
  originChainId: SupportedChainId;
  destinationChainId: SupportedBridgeChainIds;
  originTokenAddress: `0x${string}`;
  amount: string;
  receipient: `0x${string}`;
  originPublicClient: UsePublicClientReturnType<typeof wagmiConfig>;
  destinationPublicClient: UsePublicClientReturnType<typeof wagmiConfig>;
}) =>
  queryOptions({
    queryKey: [
      QueryKeys.BridgeQuote("wormhole"),
      originChainId,
      originPublicClient,
      destinationPublicClient,
      receipient,
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
        originToDestinationXTokenAddressMapping[originTokenAddress][
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

      let isLimitExceeded = +bridgeLimitFormatted < +amount;

      if (destinationChainId === mainnet.id) {
        const destinationTokenAddress =
          originToDestinationAlAssetTokenAddressMapping[originTokenAddress];

        const lockboxBalance = await destinationPublicClient.readContract({
          address: destinationTokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [lockboxMapping[destinationTokenAddress]],
        });
        const lockboxBalanceFormatted = formatEther(lockboxBalance);

        isLimitExceeded = +lockboxBalanceFormatted < +amount;
      }

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
        args: [
          BigInt(destinationWormholeChainId),
          parseEther(amount),
          receipient,
        ],
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
    enabled: !isInputZero(amount),
    retry: (failureCount, error) => {
      if (error.message === "Wormhole doesn't support ALCX") {
        return false;
      }
      if (error.message === "Unsupported origin chain") {
        return false;
      }
      if (error.message === "Unsupported destination chain") {
        return false;
      }
      return failureCount < 3;
    },
  });
