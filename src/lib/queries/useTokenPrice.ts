import { SupportedChainId } from "@/components/providers/Web3Provider";
import { useChain } from "@/hooks/useChain";
import { useQueries, useQuery } from "@tanstack/react-query";
import { arbitrum, fantom, mainnet, optimism } from "viem/chains";
import { QueryKeys } from "./queriesSchema";

const FIVE_MIN_IN_MS = 300000;

const LLAMA_API_URL = "https://coins.llama.fi/prices/current/";

const chainIdToLlamaChainNameMapping = {
  [fantom.id]: "fantom",
  [mainnet.id]: "ethereum",
  [arbitrum.id]: "arbitrum",
  [optimism.id]: "optimism",
};

const fetchPrice = async (
  chainId: SupportedChainId,
  tokenAddress: `0x${string}` | undefined,
) => {
  if (!tokenAddress)
    throw new Error("UNEXPECTED: tokenAddress is undefined in fetchPrice");
  const chainToken = `${chainIdToLlamaChainNameMapping[chainId]}:${tokenAddress}`;
  const response = await fetch(`${LLAMA_API_URL}${chainToken}`);
  const data = (await response.json()) as {
    coins: {
      [key: string]: {
        decimals: number;
        symbol: string;
        price: number;
        timestamp: number;
        confidence: number;
      };
    };
  };
  return data.coins[chainToken].price;
};

export const useGetTokenPrice = (tokenAddress: `0x${string}` | undefined) => {
  const chain = useChain();

  return useQuery({
    queryKey: [QueryKeys.TokenPrice, chain.id, tokenAddress],
    queryFn: () => fetchPrice(chain.id, tokenAddress),
    enabled: !!tokenAddress,
    refetchInterval: FIVE_MIN_IN_MS,
    staleTime: FIVE_MIN_IN_MS,
  });
};

export const useGetMultipleTokenPrices = (addresses: `0x${string}`[] = []) => {
  const chain = useChain();

  return useQueries({
    queries: addresses.map((tokenAddress) => {
      return {
        queryKey: [QueryKeys.TokenPrice, chain.id, tokenAddress],
        queryFn: () => fetchPrice(chain.id, tokenAddress),
        enabled: !!tokenAddress,
        refetchInterval: FIVE_MIN_IN_MS,
        staleTime: FIVE_MIN_IN_MS,
        refetchOnWindowFocus: false,
      };
    }),
  });
};

export const getTokenPriceInEth = async ({
  chainId,
  tokenAddress,
}: {
  chainId: SupportedChainId;
  tokenAddress: `0x${string}`;
}) => {
  const price = await fetchPrice(chainId, tokenAddress);
  const ethPriceRes = await fetch(`${LLAMA_API_URL}coingecko:ethereum`);
  const ethPriceData = (await ethPriceRes.json()) as {
    coins: {
      [key: string]: {
        decimals: number;
        symbol: string;
        price: number;
        timestamp: number;
        confidence: number;
      };
    };
  };
  const ethPrice = ethPriceData.coins["coingecko:ethereum"].price;
  return price / ethPrice;
};
