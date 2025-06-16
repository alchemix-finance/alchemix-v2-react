import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import {
  bytesToHex,
  encodeFunctionData,
  erc20Abi,
  formatEther,
  pad,
  parseEther,
  toHex,
} from "viem";
import { fantom, mainnet } from "viem/chains";
import { Options } from "@layerzerolabs/lz-v2-utilities";

import { SupportedChainId, wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { oftAbi } from "@/abi/oft";
import { SYNTHS_TO_XERC20_MAPPING } from "@/lib/config/synths";
import { isInputZero } from "@/utils/inputNotZero";
import { ONE_MINUTE_IN_MS } from "@/lib/constants";
import { QueryKeys } from "@/lib/queries/queriesSchema";

import {
  Quote,
  SupportedBridgeChainIds,
  chainIdToLayerZeroEidMapping,
  lockboxMapping,
  originToDestinationXTokenAddressMapping,
  originToDestinationAlAssetTokenAddressMapping,
  targetMapping,
} from "./constants";

const PAY_IN_LZ_TOKEN = false;

export const useBridgeQuote = ({
  originChainId,
  destinationChainId,
  originTokenAddress,
  amount,
  receipient,
}: {
  originChainId: SupportedChainId;
  destinationChainId: SupportedBridgeChainIds;
  originTokenAddress: `0x${string}`;
  amount: string;
  receipient: `0x${string}`;
}) => {
  const { address } = useAccount();

  const originPublicClient = usePublicClient<typeof wagmiConfig>({
    chainId: originChainId,
  });
  const destinationPublicClient = usePublicClient<typeof wagmiConfig>({
    chainId: destinationChainId,
  });

  return useQuery({
    queryKey: [
      QueryKeys.BridgeQuote,
      originChainId,
      originPublicClient,
      destinationPublicClient,
      address,
      receipient,
      destinationChainId,
      originTokenAddress,
      amount,
    ],
    queryFn: async () => {
      if (originChainId === fantom.id) {
        throw new Error("Unsupported origin chain");
      }
      if (!address) {
        throw new Error("Wallet not connected");
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
        args: [targetMapping[destinationChainId][xErc20Address]],
      });
      const bridgeLimitFormatted = formatEther(bridgeLimit);

      let isLimitExceeded = +bridgeLimitFormatted < +amount;
      let isOriginSizeExceeded = false;

      if (destinationChainId === mainnet.id) {
        const destinationTokenAddress =
          originToDestinationAlAssetTokenAddressMapping[originTokenAddress];

        const destinationLockboxBalancePromise =
          destinationPublicClient.readContract({
            address: destinationTokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [lockboxMapping[destinationTokenAddress]],
          });

        const originLockboxBalancePromise = originPublicClient.readContract({
          address: originTokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [lockboxMapping[originTokenAddress]],
        });

        const [destinationLockboxBalance, originLockboxBalance] =
          await Promise.all([
            destinationLockboxBalancePromise,
            originLockboxBalancePromise,
          ]);

        const destinationLockboxBalanceFormatted = formatEther(
          destinationLockboxBalance,
        );
        const originLockboxBalanceFormatted = formatEther(originLockboxBalance);

        isLimitExceeded = +destinationLockboxBalanceFormatted < +amount;
        isOriginSizeExceeded = +originLockboxBalanceFormatted < +amount;
      }

      const spender = targetMapping[originChainId][originTokenAddress];

      const destinationEndpointId =
        chainIdToLayerZeroEidMapping[destinationChainId];

      const options = Options.newOptions()
        .addExecutorLzReceiveOption(65000, 0)
        .toBytes();

      const bridgeParams = {
        amountLD: parseEther(amount),
        minAmountLD: parseEther(amount),
        dstEid: destinationEndpointId,
        to: pad(receipient),
        extraOptions: bytesToHex(options),
        composeMsg: toHex(""),
        oftCmd: toHex(""),
      } as const;

      const bridgeCost = await originPublicClient.readContract({
        address: spender,
        abi: oftAbi,
        functionName: "quoteSend",
        args: [bridgeParams, PAY_IN_LZ_TOKEN],
      });

      const nativeFee = bridgeCost.nativeFee;
      const nativeFeeFormatted = formatEther(nativeFee);

      const amountOut = amount;

      const isWrapNeeded = Object.keys(SYNTHS_TO_XERC20_MAPPING).includes(
        originTokenAddress,
      );

      const data = encodeFunctionData({
        abi: oftAbi,
        functionName: "send",
        args: [bridgeParams, bridgeCost, address],
      });

      const tx = {
        data,
        to: spender,
        value: bridgeCost.nativeFee,
        chainId: originChainId,
      };

      const quote = {
        amountOut,
        fee: nativeFeeFormatted,
        provider: "LayerZero",
        bridgeCost,
        tx,
        isWrapNeeded,
        isLimitExceeded,
        bridgeLimit: bridgeLimitFormatted,
        isOriginSizeExceeded,
      } as const satisfies Quote;

      return quote;
    },
    refetchInterval: ONE_MINUTE_IN_MS,
    enabled: !isInputZero(amount) && originChainId !== fantom.id && !!address,
  });
};
