import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useChain } from "@/hooks/useChain";
import { serialize, useAccount, usePublicClient } from "wagmi";
import { Address, zeroAddress } from "viem";
import { useAlchemists } from "@/lib/queries/useAlchemists";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { YieldTokenParams } from "@/lib/types";
import { tokenAdapterAbi } from "@/abi/tokenAdapter";
import { VAULTS } from "@/lib/config/vaults";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { ONE_MINUTE_IN_MS } from "@/lib/constants";
import { QueryKeys } from "./queriesSchema";

export const useVaults = () => {
  const chain = useChain();
  const { address = zeroAddress } = useAccount();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  const { data: alchemists } = useAlchemists();

  return useQuery({
    queryKey: [QueryKeys.Vaults, chain.id, serialize(alchemists), address],
    queryFn: async () => {
      if (!alchemists) throw new Error("Alchemists not loaded");

      const underlyingTokensCalls = alchemists.flatMap((alchemist) =>
        alchemist.underlyingTokens.map(
          (underlyingToken) =>
            ({
              abi: alchemistV2Abi,
              address: alchemist.address,
              functionName: "getUnderlyingTokenParameters",
              args: [underlyingToken],
            }) as const,
        ),
      );

      const yieldTokensCalls = alchemists.flatMap((alchemist) =>
        alchemist.yieldTokens.flatMap(
          (yieldToken) =>
            [
              {
                abi: alchemistV2Abi,
                address: alchemist.address,
                functionName: "getYieldTokenParameters",
                args: [yieldToken],
              },
              {
                abi: alchemistV2Abi,
                address: alchemist.address,
                functionName: "positions",
                args: [address, yieldToken],
              },
              {
                abi: alchemistV2Abi,
                address: alchemist.address,
                functionName: "getUnderlyingTokensPerShare",
                args: [yieldToken],
              },
              {
                abi: alchemistV2Abi,
                address: alchemist.address,
                functionName: "getYieldTokensPerShare",
                args: [yieldToken],
              },
            ] as const,
        ),
      );

      const underlyingTokensResults = await publicClient.multicall({
        allowFailure: false,
        contracts: underlyingTokensCalls,
      });

      const yieldTokensResults = await publicClient.multicall({
        allowFailure: false,
        contracts: yieldTokensCalls,
      });

      const underlyingTokens = alchemists.flatMap((alchemist) => {
        const underlyingTokenResult = underlyingTokensResults.splice(
          0,
          alchemist.underlyingTokens.length,
        );
        return alchemist.underlyingTokens.map((underlyingToken, i) => {
          const [underlyingTokenParams] = underlyingTokenResult.slice(i);
          return {
            address: underlyingToken,
            alchemist,
            underlyingTokenParams,
          };
        });
      });

      const vaults = alchemists.flatMap((alchemist) => {
        const yieldTokensResult = yieldTokensResults.splice(
          0,
          alchemist.yieldTokens.length * 4,
        );
        return alchemist.yieldTokens.map((yieldToken, i) => {
          const [
            yieldTokenParams,
            [shares, lastAccruedWeight],
            underlyingPerShare,
            yieldPerShare,
          ] = yieldTokensResult.slice(i * 4, i * 4 + 4) as [
            YieldTokenParams,
            [bigint, bigint],
            bigint,
            bigint,
          ];

          const underlyingToken = underlyingTokens.find(
            (underlyingToken) =>
              underlyingToken.address.toLowerCase() ===
              yieldTokenParams.underlyingToken.toLowerCase(),
          );

          if (!underlyingToken) throw new Error("Underlying token not found");

          return {
            address: yieldToken,
            yieldToken,
            underlyingToken: yieldTokenParams.underlyingToken,
            alchemist,
            yieldTokenParams,
            underlyingTokensParams: underlyingToken.underlyingTokenParams,
            position: {
              shares,
              lastAccruedWeight,
            },
            yieldPerShare,
            underlyingPerShare,
          };
        });
      });

      const tokenAdapterCalls = vaults.flatMap(
        (vault) =>
          [
            {
              functionName: "price",
              abi: tokenAdapterAbi,
              address: vault.yieldTokenParams.adapter,
            },
            {
              functionName: "token",
              abi: tokenAdapterAbi,
              address: vault.yieldTokenParams.adapter,
            },
            {
              functionName: "underlyingToken",
              abi: tokenAdapterAbi,
              address: vault.yieldTokenParams.adapter,
            },
            {
              functionName: "version",
              abi: tokenAdapterAbi,
              address: vault.yieldTokenParams.adapter,
            },
          ] as const,
      );

      const tokenAdapterResults = await publicClient.multicall({
        allowFailure: false,
        contracts: tokenAdapterCalls,
      });

      const vaultsWithTokenAdapters = vaults.map((vault, i) => {
        const [price, token, underlyingToken, version] =
          tokenAdapterResults.slice(i * 4, i * 4 + 4) as [
            bigint,
            Address,
            Address,
            string,
          ];

        return {
          ...vault,
          tokenAdapter: {
            price,
            token,
            underlyingToken,
            version,
          },
        };
      });

      const vaultsWithTokenAdaptersAndMetadata = vaultsWithTokenAdapters
        .filter((vault) => VAULTS[chain.id][vault.yieldToken] !== undefined)
        .map((vault) => {
          const metadata = VAULTS[chain.id][vault.yieldToken];
          return {
            ...vault,
            metadata,
          };
        });

      return vaultsWithTokenAdaptersAndMetadata;
    },
    enabled: !!alchemists,
    staleTime: ONE_MINUTE_IN_MS,
    placeholderData: keepPreviousData,
  });
};
