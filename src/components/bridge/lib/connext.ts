import { queryOptions } from "@tanstack/react-query";
import { UsePublicClientReturnType } from "wagmi";
import { fantom, mainnet } from "viem/chains";
import {
  encodeAbiParameters,
  encodeFunctionData,
  formatEther,
  parseAbi,
  parseAbiParameters,
  parseEther,
  parseUnits,
  toHex,
  hexToBigInt,
  erc20Abi,
} from "viem";

import { SupportedChainId, wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import {
  BridgeQuote,
  SupportedBridgeChainIds,
  chainIdToDomainMapping,
  connextTargetMapping,
  lockboxMapping,
  originToDestinationAlAssetTokenAddressMapping,
} from "./constants";
import { isInputZero } from "@/utils/inputNotZero";
import {
  ALCX_ARBITRUM_ADDRESS,
  ALCX_OPTIMISM_ADDRESS,
  ONE_MINUTE_IN_MS,
} from "@/lib/constants";
import { QueryKeys } from "@/lib/queries/queriesSchema";

const CONNEXT_BASE_URI = "https://sdk-server.mainnet.connext.ninja";

interface BigNumber {
  type: "BigNumber";
  hex: `0x${string}`;
}

export const getConnexQuoteQueryOptions = ({
  originChainId,
  destinationChainId,
  originTokenAddress,
  amount,
  slippage,
  receipient,
  originPublicClient,
  destinationPublicClient,
}: {
  originChainId: SupportedChainId;
  destinationChainId: SupportedBridgeChainIds;
  originTokenAddress: `0x${string}`;
  amount: string;
  slippage: string;
  receipient: `0x${string}`;
  originPublicClient: UsePublicClientReturnType<typeof wagmiConfig>;
  destinationPublicClient: UsePublicClientReturnType<typeof wagmiConfig>;
}) =>
  queryOptions({
    queryKey: [
      QueryKeys.BridgeQuote("connext"),
      originChainId,
      originPublicClient,
      destinationPublicClient,
      receipient,
      destinationChainId,
      originTokenAddress,
      amount,
      slippage,
    ],
    queryFn: async () => {
      if (originChainId === fantom.id) {
        throw new Error("Unsupported origin chain");
      }

      const originDomain = chainIdToDomainMapping[originChainId];
      const destinationDomain = chainIdToDomainMapping[destinationChainId];

      // NOTE: We do not check bridge limit for connext, because it has MAX_UINT_256 limit
      let isLimitExceeded = false;

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

      const relayerFeeResponse = await fetch(
        `${CONNEXT_BASE_URI}/estimateRelayerFee`,
        {
          method: "POST",
          body: JSON.stringify({
            originDomain,
            destinationDomain,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!relayerFeeResponse.ok) {
        throw new Error(
          `Error calling estimateRelayerFee: ${relayerFeeResponse.status} ${relayerFeeResponse.statusText}`,
        );
      }

      const relayerFeeResult = (await relayerFeeResponse.json()) as BigNumber;
      const relayerFee = hexToBigInt(relayerFeeResult.hex);

      const amountOutResponse = await fetch(
        `${CONNEXT_BASE_URI}/calculateAmountReceived`,
        {
          method: "POST",
          body: JSON.stringify({
            originDomain,
            destinationDomain,
            originTokenAddress,
            amount: parseEther(amount).toString(),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!amountOutResponse.ok) {
        throw new Error(
          `Error calling calculateAmountReceived: ${amountOutResponse.status} ${amountOutResponse.statusText}`,
        );
      }

      const {
        amountReceived,
        originSlippage,
        routerFee,
        destinationSlippage,
        isFastPath,
      } = (await amountOutResponse.json()) as {
        amountReceived: BigNumber;
        originSlippage: BigNumber;
        routerFee: BigNumber;
        destinationSlippage: BigNumber;
        isFastPath: boolean;
      };

      const formattedResult = {
        amountReceived: hexToBigInt(amountReceived.hex),
        originSlippage: hexToBigInt(originSlippage.hex),
        routerFee: hexToBigInt(routerFee.hex),
        destinationSlippage: hexToBigInt(destinationSlippage.hex),
        isFastPath: isFastPath,
      };

      const fee = formatEther(formattedResult.routerFee + relayerFee);
      const amountOut = formatEther(formattedResult.amountReceived);

      const tx = generateConnextTransaction({
        originDomain,
        destinationDomain,
        originTokenAddress,
        amount,
        relayerFee,
        originChainId,
        destinationChainId,
        receipient,
        slippage,
        publicClient: originPublicClient,
      });

      const quote = {
        fee,
        amountOut,
        provider: "Connext",
        tx,
        isLimitExceeded,
      } as const satisfies BridgeQuote;

      return quote;
    },
    refetchInterval: ONE_MINUTE_IN_MS,
    enabled: !isInputZero(amount) && originChainId !== fantom.id,
    retry: (failureCount, error) => {
      if (error.message === "Unsupported origin chain") {
        return false;
      }
      return failureCount < 3;
    },
  });

interface XCallParams {
  origin: string;
  destination: string;
  asset: `0x${string}`;
  amount: bigint;
  slippage: bigint;
  relayerFee: bigint;

  to?: `0x${string}`;
  callData?: `0x${string}`;
}

const generateConnextTransaction = ({
  originDomain,
  destinationDomain,
  originTokenAddress,
  amount,
  relayerFee,
  slippage,
  originChainId,
  destinationChainId,
  receipient,
}: {
  originDomain: string;
  destinationDomain: string;
  originTokenAddress: `0x${string}`;
  amount: string;
  relayerFee: bigint;
  slippage: string;
  originChainId: SupportedBridgeChainIds;
  destinationChainId: SupportedBridgeChainIds;
  receipient: `0x${string}`;
  publicClient: UsePublicClientReturnType<typeof wagmiConfig>;
}) => {
  const bridgeConfig: XCallParams = {
    origin: originDomain,
    destination: destinationDomain,
    asset: originTokenAddress,
    relayerFee,
    amount: parseEther(amount),
    slippage: parseUnits(slippage, 2), // BPS
  };

  const isFromEth = originChainId === mainnet.id;
  const isToEth = destinationChainId === mainnet.id;

  if (isFromEth) {
    bridgeConfig.to = receipient;
    bridgeConfig.callData = toHex("");
  } else if (isToEth) {
    // if we bridge ALCX to ETH we use alchemix lockbox adapter, for alusd and aleth we use connext lockbox adapter
    const isBridgingAlcx =
      originTokenAddress.toLowerCase() ===
        ALCX_OPTIMISM_ADDRESS.toLowerCase() ||
      originTokenAddress.toLowerCase() === ALCX_ARBITRUM_ADDRESS.toLowerCase();
    if (isBridgingAlcx) {
      // alcx lockbox adapter
      bridgeConfig.to = "0xcfe063a764EA04A9A1Dc6cf8B8978955f779fc9F";
    } else {
      // connext lockbox adapter
      bridgeConfig.to = "0x45BF3c737e57B059a5855280CA1ADb8e9606AC68";
    }
    bridgeConfig.callData = encodeAbiParameters(parseAbiParameters("address"), [
      receipient,
    ]);
  } else {
    // L2 to L2
    bridgeConfig.to = receipient;
    bridgeConfig.callData = toHex("");
  }

  const data = encodeFunctionData({
    abi: parseAbi([
      "function xcall(uint32 _destination, address _to, address _asset, address _delegate, uint256 _amount, uint256 _slippage, bytes calldata _callData) external payable returns (bytes32)",
    ]),
    args: [
      parseInt(bridgeConfig.destination),
      bridgeConfig.to,
      bridgeConfig.asset,
      bridgeConfig.to, // delegate is the same as to https://github.com/connext/monorepo/blob/main/packages/agents/sdk/src/sdkBase.ts#L191
      bridgeConfig.amount,
      bridgeConfig.slippage,
      bridgeConfig.callData,
    ],
  });

  const spender = connextTargetMapping[originChainId];

  const tx = {
    data,
    value: bridgeConfig.relayerFee,
    to: spender,
    chainId: originChainId,
  };

  return tx;
};
