import { useChain } from "@/hooks/useChain";
import { useQuery } from "@tanstack/react-query";
import { lsService } from "@/lib/localStorage";
import { useAlchemists } from "./useAlchemists";
import { VAULTS } from "@/lib/config/vaults";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { erc20Abi } from "viem";
import { usePublicClient } from "wagmi";
import { Token } from "@/lib/types";
import {
  ALCX_ARBITRUM_ADDRESS,
  ALCX_MAINNET_ADDRESS,
  ALCX_OPTIMISM_ADDRESS,
  GAS_ADDRESS,
  G_ALCX_MAINNET_ADDRESS,
  ONE_DAY_IN_MS,
} from "@/lib/constants";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { QueryKeys } from "./queriesSchema";
import { SYNTHS_TO_XERC20_MAPPING } from "../config/synths";

export const useTokensQuery = () => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const { data: alchemists } = useAlchemists();
  return useQuery({
    queryKey: [
      QueryKeys.Tokens,
      chain.id,
      publicClient,
      alchemists,
      chain.nativeCurrency.symbol,
      chain.nativeCurrency.name,
    ],
    queryFn: async () => {
      if (!alchemists) throw new Error("Alchemists not loaded");
      const tokensAddresses = alchemists.flatMap((alchemist) => [
        alchemist.debtToken,
        ...alchemist.underlyingTokens,
        ...alchemist.yieldTokens,
      ]);
      const vaultsMetadata = VAULTS[chain.id];
      const tokensAddressesFromVaultOverries = Object.values(vaultsMetadata)
        .flatMap((vaultMetadata) => vaultMetadata.yieldTokenOverride)
        .filter((token) => token !== undefined) as `0x${string}`[];
      tokensAddresses.push(...tokensAddressesFromVaultOverries);
      if (chain.id === mainnet.id) {
        tokensAddresses.push(G_ALCX_MAINNET_ADDRESS);
        tokensAddresses.push(ALCX_MAINNET_ADDRESS);
        const xAlAssets = Object.values(SYNTHS_TO_XERC20_MAPPING);
        tokensAddresses.push(...xAlAssets);
      }
      if (chain.id === arbitrum.id) {
        tokensAddresses.push(ALCX_ARBITRUM_ADDRESS);
      }
      if (chain.id === optimism.id) {
        tokensAddresses.push(ALCX_OPTIMISM_ADDRESS);
      }

      const calls = tokensAddresses.flatMap(
        (address) =>
          [
            {
              address,
              abi: erc20Abi,
              functionName: "decimals",
            },
            {
              address,
              abi: erc20Abi,
              functionName: "symbol",
            },
            {
              address,
              abi: erc20Abi,
              functionName: "name",
            },
          ] as const,
      );

      const results = await publicClient.multicall({
        allowFailure: false,
        contracts: calls,
      });

      const tokens = tokensAddresses.map((address, i) => {
        const [decimals, _symbol, name] = results.slice(i * 3, i * 3 + 3) as [
          number,
          string,
          string,
        ];

        const isUsdcE = [
          "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
          "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        ]
          .map((t) => t.toLowerCase())
          .includes(address.toLowerCase());
        const symbol = isUsdcE ? "USDC.e" : _symbol;

        const token: Token = {
          address,
          decimals,
          symbol,
          name,
        };

        return token;
      });

      const gasToken: Token = {
        address: GAS_ADDRESS,
        decimals: 18,
        symbol: chain.nativeCurrency.symbol,
        name: chain.nativeCurrency.name,
      };

      tokens.push(gasToken);

      lsService.setItem(chain.id, "tokenListCache", {
        tokens,
        timestamp: Date.now(),
      });
      return tokens;
    },
    placeholderData: lsService.getItem(chain.id, "tokenListCache")?.tokens,
    staleTime: ONE_DAY_IN_MS,
    enabled: !!alchemists,
  });
};
