import { useQuery } from "@tanstack/react-query";
import { useChain } from "@/hooks/useChain";
import { useAccount, usePublicClient } from "wagmi";
import { Address, zeroAddress } from "viem";
import { ALCHEMISTS_METADATA, SYNTH_ASSETS } from "@/lib/config/alchemists";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { QueryKeys } from "./queriesSchema";
import { ONE_MINUTE_IN_MS } from "@/lib/constants";

export const useAlchemists = () => {
  const chain = useChain();
  const { address = zeroAddress } = useAccount();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  return useQuery({
    queryKey: [QueryKeys.Alchemists, chain.id, address],
    queryFn: async () => {
      const alchemistsMetadata = ALCHEMISTS_METADATA[chain.id];

      const alchemistsArr = [
        alchemistsMetadata.alETH,
        alchemistsMetadata.alUSD,
      ];

      const alchemistWithoutZero = alchemistsArr.filter(
        (al) => al !== zeroAddress,
      );

      const calls = alchemistWithoutZero.flatMap(
        (alchemistAddress) =>
          [
            {
              abi: alchemistV2Abi,
              address: alchemistAddress,
              functionName: "transmuter",
            },
            {
              abi: alchemistV2Abi,
              address: alchemistAddress,
              functionName: "debtToken",
            },
            {
              abi: alchemistV2Abi,
              address: alchemistAddress,
              functionName: "minimumCollateralization",
            },
            {
              abi: alchemistV2Abi,
              address: alchemistAddress,
              functionName: "accounts",
              args: [address!],
            },
            {
              abi: alchemistV2Abi,
              address: alchemistAddress,
              functionName: "getSupportedYieldTokens",
            },
            {
              abi: alchemistV2Abi,
              address: alchemistAddress,
              functionName: "getSupportedUnderlyingTokens",
            },
          ] as const,
      );

      const results = await publicClient.multicall({
        allowFailure: false,
        contracts: calls,
      });

      const alchemists = alchemistWithoutZero.map((alchemist, i) => {
        const [
          transmuter,
          debtToken,
          minimumCollateralization,
          [debt, depositedTokens],
          yieldTokens,
          underlyingTokens,
        ] = results.slice(i * 6, i * 6 + 6) as [
          Address,
          Address,
          bigint,
          [bigint, Address[]],
          Address[],
          Address[],
        ];

        return {
          address: alchemist,
          synthType:
            alchemist === alchemistsMetadata.alETH
              ? SYNTH_ASSETS.ALETH
              : SYNTH_ASSETS.ALUSD,
          debtToken,
          transmuter,
          position: {
            debt,
            depositedTokens,
          },
          yieldTokens,
          underlyingTokens,
          minimumCollateralization,
        } as const;
      });

      return alchemists;
    },
    staleTime: ONE_MINUTE_IN_MS,
  });
};
