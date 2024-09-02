import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { toast } from "sonner";
import {
  encodeAbiParameters,
  formatEther,
  parseAbiParameters,
  parseEther,
  parseUnits,
  toHex,
} from "viem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { BigNumber } from "@ethersproject/bignumber";
import request, { gql } from "graphql-request";

import { QueryKeys } from "@/lib/queries/queriesSchema";
import { SYNTH_ASSETS_ADDRESSES } from "@/lib/config/synths";
import { isInputZero } from "@/utils/inputNotZero";
import {
  ALCX_ARBITRUM_ADDRESS,
  ALCX_MAINNET_ADDRESS,
  ALCX_OPTIMISM_ADDRESS,
} from "@/lib/constants";
import { useChain } from "@/hooks/useChain";
import { getSpender } from "./utils";
import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";

type AvailableTokensMapping = Record<SupportedBridgeChainIds, `0x${string}`[]>;
type TargetMapping = Record<
  SupportedBridgeChainIds,
  Record<`0x${string}`, `0x${string}`>
>;
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

export const bridgeChains = [mainnet, optimism, arbitrum];
export type SupportedBridgeChainIds = (typeof bridgeChains)[number]["id"];

export const chainIdToDomainMapping = {
  [mainnet.id]: "6648936",
  [optimism.id]: "1869640809",
  [arbitrum.id]: "1634886255",
} as const;

export const chainToAvailableTokensMapping: AvailableTokensMapping = {
  [mainnet.id]: [
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
    ALCX_MAINNET_ADDRESS,
  ],

  [optimism.id]: [
    SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
    ALCX_OPTIMISM_ADDRESS,
  ],

  [arbitrum.id]: [
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
    ALCX_ARBITRUM_ADDRESS,
  ],
};

export const targetMapping: TargetMapping = {
  [mainnet.id]: {
    [ALCX_MAINNET_ADDRESS]: "0xcfe063a764EA04A9A1Dc6cf8B8978955f779fc9F",
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH]:
      "0x45BF3c737e57B059a5855280CA1ADb8e9606AC68",
    [SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD]:
      "0x45BF3c737e57B059a5855280CA1ADb8e9606AC68",
  },
  [optimism.id]: {
    [ALCX_OPTIMISM_ADDRESS]: "0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA",
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alETH]:
      "0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA",
    [SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD]:
      "0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA",
  },
  [arbitrum.id]: {
    [ALCX_ARBITRUM_ADDRESS]: "0xEE9deC2712cCE65174B561151701Bf54b99C24C8",
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH]:
      "0xEE9deC2712cCE65174B561151701Bf54b99C24C8",
    [SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD]:
      "0xEE9deC2712cCE65174B561151701Bf54b99C24C8",
  },
};

const SUBGRAPH_API_KEY = import.meta.env.VITE_SUBGRAPH_API_KEY;
const SUBGRAPH_URLS = {
  [mainnet.id]: `https://gateway.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/Hd6Amg8XvcPRESqUtujxojk1gBEzRyoMfaP4Ue7Y1w3b`,
  [optimism.id]: `https://gateway.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/691uswDfvWDSgpUCemetuKbNViAqJ1CkgopNmweYFHQY`,
  [arbitrum.id]: `https://gateway.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/DoAaZ6zNFCbiZVDMZEgan7w9K5sJy8v6vvSCLDwyqodo`,
};

const CONNEXT_BASE_URI = "https://sdk-server.mainnet.connext.ninja";

export const useConnextRelayerFee = ({
  originDomain,
  destinationDomain,
}: {
  originDomain: string;
  destinationDomain: string;
}) => {
  return useQuery({
    queryKey: [
      QueryKeys.ConnextSdk("relayerFee"),
      originDomain,
      destinationDomain,
    ],
    queryFn: async () => {
      const response = await fetch(`${CONNEXT_BASE_URI}/estimateRelayerFee`, {
        method: "POST",
        body: JSON.stringify({
          originDomain,
          destinationDomain,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Error calling estimateRelayerFee: ${response.status} ${response.statusText}`,
        );
      }

      const result = (await response.json()) as BigNumber;
      const relayerFee = formatEther(BigInt(BigNumber.from(result).toString()));

      return relayerFee;
    },
    staleTime: Infinity,
  });
};

export const useConnextAmountOut = ({
  originDomain,
  destinationDomain,
  originTokenAddress,
  amount,
}: {
  originDomain: string;
  destinationDomain: string;
  originTokenAddress: string;
  amount: string;
}) => {
  return useQuery({
    queryKey: [
      QueryKeys.ConnextSdk("amountOut"),
      originDomain,
      destinationDomain,
      originTokenAddress,
      amount,
    ],
    queryFn: async () => {
      const response = await fetch(
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
      if (!response.ok) {
        throw new Error(
          `Error calling estimateRelayerFee: ${response.status} ${response.statusText}`,
        );
      }

      const result = (await response.json()) as {
        amountReceived: BigNumber;
        originSlippage: BigNumber;
        routerFee: BigNumber;
        destinationSlippage: BigNumber;
        isFastPath: boolean;
      };

      const formattedResult = {
        amountReceived: formatEther(
          BigInt(BigNumber.from(result.amountReceived).toString()),
        ),
        originSlippage: formatEther(
          BigInt(BigNumber.from(result.originSlippage).toString()),
        ),
        routerFee: formatEther(
          BigInt(BigNumber.from(result.routerFee).toString()),
        ),
        destinationSlippage: formatEther(
          BigInt(BigNumber.from(result.destinationSlippage).toString()),
        ),
        isFastPath: result.isFastPath,
      };

      return formattedResult;
    },
    enabled: !isInputZero(amount),
  });
};

export const useConnextWriteBridge = () => {
  const chain = useChain();
  const { address } = useAccount();
  const publicClient = usePublicClient({
    chainId: chain.id,
  });
  const { data: walletClient } = useWalletClient({
    chainId: chain.id,
  });
  return useMutation({
    mutationFn: async ({
      originDomain,
      destinationDomain,
      originChainId,
      originTokenAddress,
      amount,
      slippage,
      relayerFee,
    }: {
      originDomain: string;
      destinationDomain: string;
      originChainId: SupportedChainId;
      originTokenAddress: `0x${string}`;
      amount: string; // uint256 in string
      slippage: string; // in %
      relayerFee: string | undefined; // in wei
    }) => {
      if (!publicClient) throw new Error("Public client not ready");
      if (!address) throw new Error("Not connected");
      if (!walletClient) throw new Error("Wallet not ready");
      if (!relayerFee) throw new Error("Relayer fee not ready");

      const bridgeConfig: XCallParams = {
        origin: originDomain,
        destination: destinationDomain,
        asset: originTokenAddress,
        amount: parseEther(amount),
        relayerFee: parseEther(relayerFee),
        slippage: parseUnits(slippage, 2), // BPS
      };

      const isFromEth = originDomain === chainIdToDomainMapping[mainnet.id];
      const isToEth = destinationDomain === chainIdToDomainMapping[mainnet.id];

      if (isFromEth) {
        bridgeConfig.to = getSpender({ originChainId, originTokenAddress });
        bridgeConfig.callData = encodeAbiParameters(
          parseAbiParameters("address"),
          [address],
        );
      } else if (isToEth) {
        // if we bridge ALCX to ETH we use alchemix lockbox adapter, for alusd and aleth we use connext lockbox adapter
        const isBridgingAlcx =
          originTokenAddress.toLowerCase() ===
            ALCX_OPTIMISM_ADDRESS.toLowerCase() ||
          originTokenAddress.toLowerCase() ===
            ALCX_ARBITRUM_ADDRESS.toLowerCase();
        if (isBridgingAlcx) {
          // alcx lockbox adapter
          bridgeConfig.to = "0xcfe063a764EA04A9A1Dc6cf8B8978955f779fc9F";
        } else {
          // connext lockbox adapter "0xcfe063a764EA04A9A1Dc6cf8B8978955f779fc9F"
          bridgeConfig.to = "0x45BF3c737e57B059a5855280CA1ADb8e9606AC68";
        }
        bridgeConfig.callData = encodeAbiParameters(
          parseAbiParameters("address"),
          [address],
        );
      } else {
        // L2 to L2
        bridgeConfig.to = address;
        bridgeConfig.callData = toHex("");
      }

      const xCallData = encodeAbiParameters(
        parseAbiParameters(
          "uint32,address,address,address,uint256,uint256,bytes",
        ),
        [
          parseInt(bridgeConfig.destination),
          bridgeConfig.to,
          bridgeConfig.asset,
          bridgeConfig.to, // delegate is the same as to https://github.com/connext/monorepo/blob/main/packages/agents/sdk/src/sdkBase.ts#L191
          bridgeConfig.amount,
          bridgeConfig.slippage,
          bridgeConfig.callData,
        ],
      );

      const request = await publicClient.prepareTransactionRequest({
        account: address,
        to: getSpender({ originChainId, originTokenAddress }),
        data: xCallData,
        value: bridgeConfig.relayerFee,
        chainId: originChainId,
      });

      const hash = await walletClient.sendTransaction(request);

      const executionPromise = () =>
        new Promise((resolve, reject) => {
          publicClient
            .waitForTransactionReceipt({
              hash,
            })
            .then((receipt) =>
              receipt.status === "success"
                ? resolve(receipt)
                : reject(new Error("Transaction reverted")),
            );
        });

      toast.promise(executionPromise, {
        loading: "Bridging...",
        success: "Bridge success!",
        error: "Bridge failed.",
      });
      await executionPromise();

      return hash;
    },
    onError: (error) =>
      toast.error("Bridge failed.", {
        description: error.message,
      }),
  });
};

export const useSubgraphOriginData = ({
  transactionHash,
}: {
  transactionHash: `0x${string}` | undefined;
}) => {
  const chain = useChain();
  return useQuery({
    queryKey: [
      QueryKeys.ConnextSdk("originTxSubgraph"),
      chain.id,
      transactionHash,
    ],
    queryFn: async () => {
      if (!transactionHash) throw new Error("No transaction hash provided");

      const query = gql`
        query OriginTransfer {
          originTransfers(where: { transactionHash: $transactionHash }) {
            # Meta Data
            chainId
            nonce
            transferId
            to
            delegate
            receiveLocal
            callData
            slippage
            originSender
            originDomain
            destinationDomain
            transactionHash
            bridgedAmt
            status
            timestamp
            normalizedIn
            # Asset Data
            asset {
              id
              adoptedAsset
              canonicalId
              canonicalDomain
            }
          }
        }
      `;

      const txFromSubgraph = await request<
        {
          originTransfers: {
            chainId: string;
            nonce: string;
            transferId: string;
            to: string;
            delegate: string;
            receiveLocal: string;
            callData: string;
            slippage: string;
            originSender: string;
            originDomain: string;
            destinationDomain: string;
            transactionHash: string;
            bridgedAmt: string;
            status: string;
            timestamp: string;
            normalizedIn: string;
            asset: {
              id: string;
              adoptedAsset: string;
              canonicalId: string;
              canonicalDomain: string;
            };
          }[];
        },
        { transactionHash: string }
      >(SUBGRAPH_URLS[chain.id as SupportedBridgeChainIds], query, {
        transactionHash,
      });

      const tx = txFromSubgraph.originTransfers[0];

      return tx.transferId;
    },
    enabled: !!transactionHash,
  });
};

export const useSubgraphDestinationData = ({
  transferId,
  destinationChainId,
}: {
  transferId: string | undefined;
  destinationChainId: SupportedBridgeChainIds;
}) => {
  return useQuery({
    queryKey: [
      QueryKeys.ConnextSdk("destinationTxSubgraph"),
      destinationChainId,
      transferId,
    ],
    queryFn: async () => {
      if (!transferId) throw new Error("No transfer id provided");

      const query = gql`
        query OriginTransfer {
          originTransfers(
            where: {
              transferId: ${transferId}
            }
          ) {
            # Meta Data
            chainId
            nonce
            transferId
            to
            delegate
            receiveLocal
            callData
            slippage
            originSender
            originDomain
            destinationDomain
            transactionHash
            bridgedAmt
            status
            timestamp
            normalizedIn
            # Asset Data
            asset {
              id
              adoptedAsset
              canonicalId
              canonicalDomain
            }
          }
        }
      `;

      const txFromSubgraph = await request<
        {
          originTransfers: {
            chainId: string;
            nonce: string;
            transferId: string;
            to: string;
            delegate: string;
            receiveLocal: string;
            callData: string;
            slippage: string;
            originSender: string;
            originDomain: string;
            destinationDomain: string;
            transactionHash: string;
            bridgedAmt: string;
            status: string;
            timestamp: string;
            normalizedIn: string;
            asset: {
              id: string;
              adoptedAsset: string;
              canonicalId: string;
              canonicalDomain: string;
            };
          }[];
        },
        {
          transferId: string;
        }
      >(SUBGRAPH_URLS[destinationChainId], query, { transferId });

      const tx = txFromSubgraph.originTransfers[0];

      return { status: tx.status, destinationHash: tx.transactionHash };
    },
    enabled: !!transferId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && data.status !== "Executed") return 10000;
      return false;
    },
  });
};
