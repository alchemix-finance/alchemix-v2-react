import { useAccount, useWalletClient } from "wagmi";
import { toast } from "sonner";
import {
  encodeAbiParameters,
  formatEther,
  parseAbiParameters,
  parseEther,
  parseUnits,
} from "viem";
import { useMutation, useQuery } from "@tanstack/react-query";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { BigNumber } from "@ethersproject/bignumber";
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

type AvailableTokensMapping = Record<SupportedBridgeChainIds, `0x${string}`[]>;
type TargetMapping = Record<
  SupportedBridgeChainIds,
  Record<`0x${string}`, `0x${string}`>
>;
interface XCallParams {
  origin: string;
  destination: string;
  asset: `0x${string}`;
  amount: string;
  slippage: string;
  relayerFee: string;

  to?: `0x${string}`;
  callData?: `0x${string}`;
}

const ETH_DOMAIN = 6648936;

export const bridgeChains = [mainnet, optimism, arbitrum];
export type SupportedBridgeChainIds = (typeof bridgeChains)[number]["id"];

export const chainIdToDomainMapping = {
  [mainnet.id]: "6648936",
  [optimism.id]: "1869640809",
  [arbitrum.id]: "1634886255",
} as const;

export const chainToAvailableTokensMapping: AvailableTokensMapping = {
  [mainnet.id]: [
    ALCX_MAINNET_ADDRESS,
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
  ],

  [optimism.id]: [
    ALCX_OPTIMISM_ADDRESS,
    SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
    SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
  ],

  [arbitrum.id]: [
    ALCX_ARBITRUM_ADDRESS,
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
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
  const { data: wallet } = useWalletClient({
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
      originChainId: SupportedBridgeChainIds;
      originTokenAddress: `0x${string}`;
      amount: string; // uint256 in string
      slippage: string; // in %
      relayerFee: string; // in wei
    }) => {
      if (!address) throw new Error("Not connected");
      if (!wallet) throw new Error("Wallet not ready");
      if (!relayerFee) throw new Error("Relayer fee not ready");

      const bridgeConfig: XCallParams = {
        origin: originDomain,
        destination: destinationDomain,
        asset: originTokenAddress,
        amount: parseEther(amount).toString(),
        relayerFee: parseEther(relayerFee).toString(),
        slippage: parseUnits(slippage, 2).toString(), // BPS
      };

      const isFromEth = +originDomain === ETH_DOMAIN;
      const isToEth = +destinationDomain === ETH_DOMAIN;

      if (isFromEth) {
        // TODO: Double check that this is correct (i scarped it from approve transactions in connext ui, but didn't see if the subsequent tx targets the spender)
        bridgeConfig.to = getSpender({ originChainId, originTokenAddress });
        bridgeConfig.callData = encodeAbiParameters(
          parseAbiParameters("address"),
          [address],
        );
        return;
      } else if (isToEth) {
        // L2 to L1
      } else {
        // L2 to L2
      }

      const response = await fetch(`${CONNEXT_BASE_URI}/xcall`, {
        method: "POST",
        body: JSON.stringify(bridgeConfig),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(
          `Error calling estimateRelayerFee: ${response.status} ${response.statusText}`,
        );
      }

      const xcallTxReq = await response.json();

      const xcallTx = await wallet.sendTransaction(xcallTxReq);

      toast.promise(
        () =>
          new Promise((resolve, reject) =>
            xcallTx
              .wait()
              .then((receipt) => (receipt.status === 1 ? resolve : reject)),
          ),
        {
          loading: "Bridging...",
          success: "Bridge success!",
          error: "Bridge failed.",
        },
      );
      await xcallTx.wait();
    },
  });
};
