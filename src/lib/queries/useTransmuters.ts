import { TRANSMUTERS } from "@/lib/config/transmuters";
import { useQuery } from "@tanstack/react-query";
import { useChain } from "@/hooks/useChain";
import { transmuterV2Abi } from "@/abi/transmuterV2";
import { useAccount, usePublicClient } from "wagmi";
import { Address, zeroAddress } from "viem";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { QueryKeys } from "./queriesSchema";
import { ONE_MINUTE_IN_MS } from "@/lib/constants";

export const useTransmuters = () => {
  const chain = useChain();
  const { address = zeroAddress } = useAccount();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  return useQuery({
    queryKey: [QueryKeys.Transmuters, chain.id, address],
    queryFn: async () => {
      const transmutersMetadata = TRANSMUTERS[chain.id];

      const calls = transmutersMetadata.flatMap(
        ({ address: transmuterAddress }) =>
          [
            {
              abi: transmuterV2Abi,
              address: transmuterAddress,
              functionName: "syntheticToken",
            },
            {
              abi: transmuterV2Abi,
              address: transmuterAddress,
              functionName: "totalUnexchanged",
            },
            {
              abi: transmuterV2Abi,
              address: transmuterAddress,
              functionName: "underlyingToken",
            },
            {
              abi: transmuterV2Abi,
              address: transmuterAddress,
              functionName: "totalBuffered",
            },
            {
              abi: transmuterV2Abi,
              address: transmuterAddress,
              functionName: "getUnexchangedBalance",
              args: [address!],
            },
            {
              abi: transmuterV2Abi,
              address: transmuterAddress,
              functionName: "getExchangedBalance",
              args: [address!],
            },
            {
              abi: transmuterV2Abi,
              address: transmuterAddress,
              functionName: "getClaimableBalance",
              args: [address!],
            },
            {
              abi: transmuterV2Abi,
              address: transmuterAddress,
              functionName: "isPaused",
            },
          ] as const,
      );

      const results = await publicClient.multicall({
        allowFailure: false,
        contracts: calls,
      });

      const transmuters = transmutersMetadata.map((transmuter, i) => {
        const [
          syntheticToken,
          totalUnexchanged,
          underlyingToken,
          totalBuffered,
          unexchangedBalance,
          exchangedBalance,
          claimableBalance,
          isPaused,
        ] = results.slice(i * 8, i * 8 + 8) as [
          Address,
          bigint,
          Address,
          bigint,
          bigint,
          bigint,
          bigint,
          boolean,
        ];

        return {
          address: transmuter.address,
          syntheticToken,
          totalUnexchanged,
          underlyingToken,
          totalBuffered,
          account: {
            unexchangedBalance,
            exchangedBalance,
            claimableBalance,
          },
          isPaused,
          metadata: transmuter,
        };
      });

      return transmuters;
    },
    staleTime: ONE_MINUTE_IN_MS,
  });
};
