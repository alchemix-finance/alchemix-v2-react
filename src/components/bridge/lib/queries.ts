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
import { isInputZero } from "@/utils/inputNotZero";
import { MAX_UINT256_BN, HALF_MINUTE_IN_MS } from "@/lib/constants";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { SYNTH_ASSETS_ADDRESSES } from "@/lib/config/synths";

import {
  Quote,
  RecoveryQuote,
  SupportedBridgeChainIds,
  chainIdToLayerZeroEidMapping,
  lockboxMapping,
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
      destinationChainId,
      originPublicClient,
      destinationPublicClient,
      originTokenAddress,
      address,
      amount,
      receipient,
    ],
    queryFn: async () => {
      if (originChainId === fantom.id) {
        throw new Error("Unsupported origin chain");
      }
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const destinationTokenAddress =
        originToDestinationAlAssetTokenAddressMapping[originChainId][
          originTokenAddress
        ][destinationChainId];

      let isFromMainnetLockboxBalanceExceeded = false;
      let isToMainnetLockboxBalanceExceeded = false;
      let mainnetLockboxBalanceFormatted = "0";
      let destinationBridgeLimit = MAX_UINT256_BN;

      if (destinationChainId !== mainnet.id) {
        destinationBridgeLimit = await destinationPublicClient.readContract({
          address: destinationTokenAddress,
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
          args: [targetMapping[destinationChainId][destinationTokenAddress]],
        });
      }

      const destinationBridgeLimitFormatted = formatEther(
        destinationBridgeLimit,
      );
      const isDestinationBridgeLimitExceeded =
        +destinationBridgeLimitFormatted < +amount;

      if (destinationChainId === mainnet.id) {
        const destinationLockboxBalance =
          await destinationPublicClient.readContract({
            address: destinationTokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [lockboxMapping[destinationTokenAddress]],
          });

        const destinationLockboxBalanceFormatted = formatEther(
          destinationLockboxBalance,
        );

        mainnetLockboxBalanceFormatted = destinationLockboxBalanceFormatted;
        isToMainnetLockboxBalanceExceeded =
          +destinationLockboxBalanceFormatted < +amount;
      }

      if (originChainId === mainnet.id) {
        const originLockboxBalance = await originPublicClient.readContract({
          address: originTokenAddress,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [lockboxMapping[originTokenAddress]],
        });
        const originLockboxBalanceFormatted = formatEther(originLockboxBalance);

        isFromMainnetLockboxBalanceExceeded =
          +originLockboxBalanceFormatted < +amount;
      }

      const spender = targetMapping[originChainId][originTokenAddress];

      const destinationEndpointId =
        chainIdToLayerZeroEidMapping[destinationChainId];

      const options = Options.newOptions()
        .addExecutorLzReceiveOption(200000, 0)
        .toBytes();

      const bridgeParams = {
        amountLD: parseEther(amount),
        minAmountLD: parseEther((Math.floor(+amount * 1e6) / 1e6).toString()),
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
        isFromMainnetLockboxBalanceExceeded,
        isDestinationBridgeLimitExceeded,
        isToMainnetLockboxBalanceExceeded,
        destinationBridgeLimit: destinationBridgeLimitFormatted,
        toMainnetLockboxBalance: mainnetLockboxBalanceFormatted,
      } as const satisfies Quote;

      return quote;
    },
    refetchInterval: HALF_MINUTE_IN_MS,
    enabled: !isInputZero(amount) && originChainId !== fantom.id && !!address,
  });
};

export const useExchangeQuote = () => {
  const { address } = useAccount();

  const originPublicClient = usePublicClient<typeof wagmiConfig>({
    chainId: mainnet.id,
  });

  return useQuery({
    queryKey: [QueryKeys.ExchangeQuote, originPublicClient, address],
    queryFn: async () => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      const alUsdTokenAddress = SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD;
      const alEthTokenAddress = SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH;

      const toAlUsd = targetMapping[mainnet.id][alUsdTokenAddress];
      const toAlEth = targetMapping[mainnet.id][alEthTokenAddress];

      const xAlUsdBalancePromise = originPublicClient.readContract({
        address: toAlUsd,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      });
      const alUsdLockboxLiquidityPromise = originPublicClient.readContract({
        address: alUsdTokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [toAlUsd],
      });

      const xAlEthBalancePromise = originPublicClient.readContract({
        address: toAlEth,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      });
      const alEthLockboxLiquidityPromise = originPublicClient.readContract({
        address: alEthTokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [toAlEth],
      });

      const [
        xAlUsdBalance,
        alUsdLockboxLiquidity,
        xAlEthBalance,
        alEthLockboxLiquidity,
      ] = await Promise.all([
        xAlUsdBalancePromise,
        alUsdLockboxLiquidityPromise,
        xAlEthBalancePromise,
        alEthLockboxLiquidityPromise,
      ]);

      const xAlUsdBalanceFormatted = formatEther(xAlUsdBalance);
      const alUsdLockboxLiquidityFormatted = formatEther(alUsdLockboxLiquidity);

      const xAlEthBalanceFormatted = formatEther(xAlEthBalance);
      const alEthLockboxLiquidityFormatted = formatEther(alEthLockboxLiquidity);

      const exchangeAlUsdCalldata = encodeFunctionData({
        abi: oftAbi,
        functionName: "exchange",
        args: [xAlUsdBalance],
      });

      const exchangeAlEthCalldata = encodeFunctionData({
        abi: oftAbi,
        functionName: "exchange",
        args: [xAlEthBalance],
      });

      const alUsdTx = {
        data: exchangeAlUsdCalldata,
        to: toAlUsd,
        chainId: mainnet.id,
      };

      const alEthTx = {
        data: exchangeAlEthCalldata,
        to: toAlEth,
        chainId: mainnet.id,
      };

      const alUSD = {
        xAlAssetBalance: xAlUsdBalance,
        xAlAssetBalanceFormatted: xAlUsdBalanceFormatted,
        alAssetLockboxLiquidity: alUsdLockboxLiquidity,
        alAssetLockboxLiquidityFormatted: alUsdLockboxLiquidityFormatted,
        tx: alUsdTx,
      } as const satisfies RecoveryQuote;
      const alETH = {
        xAlAssetBalance: xAlEthBalance,
        xAlAssetBalanceFormatted: xAlEthBalanceFormatted,
        alAssetLockboxLiquidity: alEthLockboxLiquidity,
        alAssetLockboxLiquidityFormatted: alEthLockboxLiquidityFormatted,
        tx: alEthTx,
      } as const satisfies RecoveryQuote;

      return {
        alUSD,
        alETH,
      } as const;
    },
    enabled: !!address,
  });
};
