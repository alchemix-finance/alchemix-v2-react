import { useQuery } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { Address, zeroAddress } from "viem";

import { useChain } from "@/hooks/useChain";
import { ALCHEMISTS_METADATA } from "@/lib/config/alchemists";
import { SYNTH_ASSETS } from "@/lib/config/synths";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { SupportedChainId, wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { QueryKeys } from "./queriesSchema";
import { ONE_MINUTE_IN_MS } from "@/lib/constants";

export const useAlchemists = (overrideChainId?: SupportedChainId) => {
  const overrideChain = wagmiConfig.chains.find(
    (c) => c.id === overrideChainId,
  );
  const _chain = useChain();
  const chain = overrideChain ?? _chain;

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
              args: [address],
            },
            {
              abi: alchemistV2Abi,
              address: alchemistAddress,
              functionName: "totalValue",
              args: [address],
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
          totalValue,
          yieldTokens,
          underlyingTokensAddresses,
        ] = results.slice(i * 7, i * 7 + 7) as [
          Address,
          Address,
          bigint,
          [bigint, Address[]],
          bigint,
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
          totalValue,
          yieldTokens,
          underlyingTokensAddresses,
          minimumCollateralization,
        } as const;
      });

      const underlyingTokensCalls = alchemists.flatMap((alchemist) =>
        alchemist.underlyingTokensAddresses.map(
          (underlyingTokenAddress) =>
            ({
              abi: alchemistV2Abi,
              address: alchemist.address,
              functionName: "getUnderlyingTokenParameters",
              args: [underlyingTokenAddress],
            }) as const,
        ),
      );

      const underlyingTokensResults = await publicClient.multicall({
        allowFailure: false,
        contracts: underlyingTokensCalls,
      });

      const underlyingTokens = alchemists.flatMap((alchemist) => {
        const underlyingTokenResult = underlyingTokensResults.splice(
          0,
          alchemist.underlyingTokensAddresses.length,
        );
        return alchemist.underlyingTokensAddresses.map((underlyingToken, i) => {
          const [underlyingTokenParams] = underlyingTokenResult.slice(i);
          return {
            address: underlyingToken,
            alchemist,
            underlyingTokenParams,
          };
        });
      });

      const alchemistsWithUnderlyingTokens = alchemists.map((alchemist) => {
        return {
          ...alchemist,
          underlyingTokens,
        };
      });

      return alchemistsWithUnderlyingTokens;
    },
    staleTime: ONE_MINUTE_IN_MS,
  });
};
