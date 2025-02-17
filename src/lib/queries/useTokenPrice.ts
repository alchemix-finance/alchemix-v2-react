import { queryOptions, useQueries, useQuery } from "@tanstack/react-query";
import { arbitrum, fantom, linea, mainnet, metis, optimism } from "viem/chains";

import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";
import { useChain } from "@/hooks/useChain";
import { useSettings } from "@/components/providers/SettingsProvider";
import { QueryKeys } from "./queriesSchema";
import { SupportedCurrency } from "../types";
import { FIVE_MIN_IN_MS, GAS_ADDRESS } from "../constants";

interface FetchPriceArgs {
  chainId: SupportedChainId;
  tokenAddress: `0x${string}` | undefined;
  currency: SupportedCurrency;
  ethPrice: number | undefined;
}

const LLAMA_API_URL = "https://coins.llama.fi/prices/current/";

const chainIdToLlamaChainNameMapping = {
  [fantom.id]: "fantom",
  [mainnet.id]: "ethereum",
  [arbitrum.id]: "arbitrum",
  [optimism.id]: "optimism",
  [linea.id]: "linea",
  [metis.id]: "metis",
};

const wethMapping = {
  [mainnet.id]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  [arbitrum.id]: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
  [optimism.id]: "0x4200000000000000000000000000000000000006",
  [linea.id]: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f",
};

export const ethPriceQueryOptions = queryOptions({
  queryKey: [QueryKeys.TokenPrice, LLAMA_API_URL],
  queryFn: async () => {
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

    return ethPrice;
  },
  refetchInterval: FIVE_MIN_IN_MS,
  staleTime: FIVE_MIN_IN_MS,
});

const useEthPrice = () => {
  return useQuery(ethPriceQueryOptions);
};

export const useGetTokenPrice = (tokenAddress: `0x${string}` | undefined) => {
  const { currency } = useSettings();
  const chain = useChain();

  const { data: ethPrice } = useEthPrice();

  return useQuery({
    queryKey: [
      QueryKeys.TokenPrice,
      currency,
      chain.id,
      ethPrice,
      tokenAddress,
    ],
    queryFn: () =>
      fetchPrice({ chainId: chain.id, tokenAddress, currency, ethPrice }),
    enabled: !!tokenAddress && ethPrice !== undefined,
    refetchInterval: FIVE_MIN_IN_MS,
    staleTime: FIVE_MIN_IN_MS,
  });
};

export const useGetMultipleTokenPrices = (addresses: `0x${string}`[] = []) => {
  const { currency } = useSettings();
  const chain = useChain();

  const { data: ethPrice } = useEthPrice();

  return useQueries({
    queries: addresses.map((tokenAddress) => {
      return {
        queryKey: [
          QueryKeys.TokenPrice,
          currency,
          chain.id,
          ethPrice,
          tokenAddress,
        ],
        queryFn: () =>
          fetchPrice({ chainId: chain.id, tokenAddress, currency, ethPrice }),
        enabled: !!tokenAddress && ethPrice !== undefined,
        refetchInterval: FIVE_MIN_IN_MS,
        staleTime: FIVE_MIN_IN_MS,
        refetchOnWindowFocus: false,
      };
    }),
  });
};

const fetchPrice = async ({
  chainId,
  tokenAddress,
  currency,
  ethPrice,
}: FetchPriceArgs) => {
  if (currency === "USD") {
    return fetchPriceInUsd({ chainId, tokenAddress, ethPrice });
  }
  return fetchPriceInEth({ chainId, tokenAddress, ethPrice });
};

const fetchPriceInUsd = async ({
  chainId,
  tokenAddress,
  ethPrice,
}: {
  chainId: SupportedChainId;
  tokenAddress: `0x${string}` | undefined;
  ethPrice: number | undefined;
}) => {
  if (!tokenAddress)
    throw new Error("UNEXPECTED: tokenAddress is undefined in fetchPrice");
  if (ethPrice === undefined)
    throw new Error("UNEXPECTED: ethPrice is undefined in fetchPrice");

  if (isTokenIsEthOrWeth({ chainId, tokenAddress })) {
    return ethPrice;
  }

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

export const fetchPriceInEth = async ({
  chainId,
  tokenAddress,
  ethPrice,
}: {
  chainId: SupportedChainId;
  tokenAddress: `0x${string}` | undefined;
  ethPrice: number | undefined;
}) => {
  if (!tokenAddress)
    throw new Error("UNEXPECTED: tokenAddress is undefined in fetchPriceInEth");
  if (ethPrice === undefined) {
    throw new Error("UNEXPECTED: ethPrice is undefined in fetchPriceInEth");
  }

  if (isTokenIsEthOrWeth({ chainId, tokenAddress })) {
    return 1;
  }

  const price = await fetchPriceInUsd({ chainId, tokenAddress, ethPrice });
  return price / ethPrice;
};

/**
 * Check if token is ETH or WETH.
 * In supported chains only fantom uses another native token (FTM) as gas.
 * And we hardcode WETH to ETH.
 */
const isTokenIsEthOrWeth = ({
  tokenAddress,
  chainId,
}: {
  tokenAddress: `0x${string}`;
  chainId: SupportedChainId;
}) => {
  return (
    chainId !== fantom.id &&
    chainId !== metis.id &&
    (tokenAddress === GAS_ADDRESS ||
      tokenAddress.toLowerCase() === wethMapping[chainId].toLowerCase())
  );
};
