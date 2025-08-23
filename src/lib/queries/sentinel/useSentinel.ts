import { useAccount, usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { base, fantom, linea, metis } from "viem/chains";

import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useChain } from "@/hooks/useChain";
import { ALCHEMISTS_METADATA } from "@/lib/config/alchemists";
import { ONE_DAY_IN_MS } from "@/lib/constants";
import { SYNTH_ASSETS_ADDRESSES } from "@/lib/config/synths";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { alTokenAbi } from "@/abi/alToken";
import { TRANSMUTERS } from "@/lib/config/transmuters";

const SENTINEL_ROLE =
  "0xd3eedd6d69d410e954f4c622838ecc3acae9fdcd83cad412075c85b092770656";

export const useSentinel = () => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  const { address = zeroAddress } = useAccount();

  return useQuery({
    queryKey: [QueryKeys.Sentinels, chain.id, address],
    queryFn: async () => {
      const alchemistsMetadata = ALCHEMISTS_METADATA[chain.id];
      const alchemistWithoutZero = [
        alchemistsMetadata.alETH,
        alchemistsMetadata.alUSD,
      ].filter((al) => al !== zeroAddress);

      let alAssets: `0x${string}`[] = [];
      let transmuters: `0x${string}`[] = [];

      if (
        chain.id !== linea.id &&
        chain.id !== metis.id &&
        chain.id !== base.id &&
        chain.id !== fantom.id
      ) {
        alAssets = [
          SYNTH_ASSETS_ADDRESSES[chain.id].alUSD,
          SYNTH_ASSETS_ADDRESSES[chain.id].alETH,
        ];
      }

      if (
        chain.id !== linea.id &&
        chain.id !== metis.id &&
        chain.id !== base.id &&
        chain.id !== fantom.id
      ) {
        transmuters = TRANSMUTERS[chain.id].map(
          (transmuter) => transmuter.address,
        );
      }

      const alchemistSentinelsPromise = publicClient.multicall({
        allowFailure: false,
        contracts: alchemistWithoutZero.map(
          (alchemist) =>
            ({
              address: alchemist,
              abi: alchemistV2Abi,
              functionName: "sentinels",
              args: [address],
            }) as const,
        ),
      });

      const alTokenSentinelsPromise = publicClient.multicall({
        allowFailure: false,
        contracts: alAssets.map(
          (alAsset) =>
            ({
              address: alAsset,
              abi: alTokenAbi,
              functionName: "hasRole",
              args: [SENTINEL_ROLE, address],
            }) as const,
        ),
      });

      const transmuterSentinelsPromise = publicClient.multicall({
        allowFailure: false,
        contracts: transmuters.map(
          (transmuter) =>
            ({
              address: transmuter,
              abi: alTokenAbi,
              functionName: "hasRole",
              args: [SENTINEL_ROLE, address],
            }) as const,
        ),
      });

      const [alchemistSentinels, alTokenSentinels, transmuterSentinels] =
        await Promise.all([
          alchemistSentinelsPromise,
          alTokenSentinelsPromise,
          transmuterSentinelsPromise,
        ]);

      const isAlchemistSentinel = alchemistSentinels.some(
        (isSentinel) => isSentinel === true,
      );

      const isAlTokenSentinel = alTokenSentinels.some(
        (isSentinel) => isSentinel === true,
      );

      const isTransmuterSentinel = transmuterSentinels.some(
        (isSentinel) => isSentinel === true,
      );

      return {
        isSentinel:
          isAlchemistSentinel || isAlTokenSentinel || isTransmuterSentinel,
        isAlTokenSentinel,
        isAlchemistSentinel,
        isTransmuterSentinel,
      };
    },
    staleTime: ONE_DAY_IN_MS,
  });
};
