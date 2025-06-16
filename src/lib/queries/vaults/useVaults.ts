import { useQuery } from "@tanstack/react-query";
import { useChain } from "@/hooks/useChain";
import { useAccount, usePublicClient } from "wagmi";
import { Address, zeroAddress } from "viem";
import { useAlchemists } from "@/lib/queries/useAlchemists";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { YieldTokenParams } from "@/lib/types";
import { tokenAdapterAbi } from "@/abi/tokenAdapter";
import { MAX_LOSS_CHECKER_ADDRESSES, VAULTS } from "@/lib/config/vaults";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { ONE_MINUTE_IN_MS } from "@/lib/constants";
import { QueryKeys } from "../queriesSchema";

export const useVaults = () => {
  const chain = useChain();
  const { address = zeroAddress } = useAccount();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  const { data: alchemists } = useAlchemists();

  return useQuery({
    queryKey: [QueryKeys.Vaults, chain.id, alchemists, address],
    queryFn: async () => {
      if (!alchemists) throw new Error("Alchemists not loaded");

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

      const yieldTokensResults = await publicClient.multicall({
        allowFailure: false,
        contracts: yieldTokensCalls,
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

          const underlyingToken = alchemist.underlyingTokens.find(
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

      const maxLossCheckCalls = vaultsWithTokenAdapters.map((vault) => ({
        address: MAX_LOSS_CHECKER_ADDRESSES[chain.id],
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "alchemixContract_",
                type: "address",
              },
              {
                internalType: "address",
                name: "yieldToken_",
                type: "address",
              },
            ],
            name: "getCheckLossExceedsMaxLoss",
            outputs: [
              {
                internalType: "bool",
                name: "isLossGreaterThanMaxLoss",
                type: "bool",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ] as const,
        functionName: "getCheckLossExceedsMaxLoss",
        args: [vault.alchemist.address, vault.yieldToken],
      }));

      const maxLossCheckResults = await publicClient.multicall({
        contracts: maxLossCheckCalls,
      });

      const vaultsWithCheckedMaxLoss = vaultsWithTokenAdapters.map(
        (vault, i) => ({
          ...vault,
          isLossGreaterThanMaxLoss: maxLossCheckResults[i].result,
        }),
      );

      const vaultsWithTokenAdaptersAndMetadata = vaultsWithCheckedMaxLoss
        .filter((vault) => VAULTS[chain.id][vault.yieldToken] !== undefined)
        .map((vault) => {
          const metadata = {
            ...VAULTS[chain.id][vault.yieldToken],
            messages: [
              ...VAULTS[chain.id][vault.yieldToken].messages,
              ...(vault.isLossGreaterThanMaxLoss
                ? [
                    {
                      type: "warning",
                      message:
                        "This vault has limited functionality due to experiencing a loss.",
                      learnMoreUrl:
                        "https://alchemix-finance.gitbook.io/user-docs/resources/guides/vault-losses-and-collateral-de-pegging",
                    } as const,
                  ]
                : []),
            ],
          };
          return {
            ...vault,
            metadata,
          };
        });

      return vaultsWithTokenAdaptersAndMetadata;
    },
    enabled: !!alchemists,
    staleTime: ONE_MINUTE_IN_MS,
    // Keep previous data when the chain is the same
    // Prevents the component from going into pending state when query is invalidated
    placeholderData: (previousData, previousQuery) =>
      chain.id === previousQuery?.queryKey[1] ? previousData : undefined,
  });
};
