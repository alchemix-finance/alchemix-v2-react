import { usePublicClient } from "wagmi";
import { gql, request } from "graphql-request";
import { formatEther, formatUnits } from "viem";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { useQuery } from "@tanstack/react-query";

import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { FIVE_MIN_IN_MS } from "@/lib/constants";
import { QueryKeys } from "../queriesSchema";
import { useChain } from "@/hooks/useChain";
import { veloStatsAbi } from "@/abi/veloStats";

export const useEthArbExternalFarmsAprs = () => {
  const chain = useChain();
  return useQuery({
    queryKey: [QueryKeys.ExternalFarmsApr, chain.id],
    queryFn: async () => {
      if (chain.id === mainnet.id) {
        const auraUrl = "https://data.aura.finance/graphql";
        const query = gql`
          {
            pool(chainId: 1, id: "74") {
              aprs {
                total
                breakdown {
                  value
                  name
                }
              }
            }
          }
        `;

        const responseAura = await request<{
          pool: {
            aprs: {
              total: number;
              breakdown: {
                value: number;
                name: string;
              }[];
            };
          };
        }>(auraUrl, query);

        const auraApr = responseAura.pool.aprs.total;

        const requestConvex = await fetch(
          "https://www.convexfinance.com/api/curve-apys",
        );
        const responseConvex = (await requestConvex.json()) as {
          apys: {
            [key: string]: {
              baseApy: number;
              crvApy: number;
            };
          };
        };

        return {
          "AURA x Balancer ALCX-WETH": auraApr,
          "Curve x Convex alUSD-3CRV":
            responseConvex.apys["37"].baseApy +
            responseConvex.apys["37"].crvApy,
          "Curve x Convex alUSD-FRAXBP":
            responseConvex.apys["factory-v2-147"].baseApy +
            responseConvex.apys["factory-v2-147"].crvApy,
          "Curve x Convex alETH-WETH":
            responseConvex.apys["factory-stable-ng-36"].baseApy +
            responseConvex.apys["factory-stable-ng-36"].crvApy,
          "Curve x Convex alETH-frxETH":
            responseConvex.apys["factory-v2-253"].baseApy +
            responseConvex.apys["factory-v2-253"].crvApy,
          "Curve x Convex ALCX-FRAXBP":
            responseConvex.apys["factory-crypto-96"].baseApy +
            responseConvex.apys["factory-crypto-96"].crvApy,
        } as Record<string, number>;
      }

      if (chain.id === arbitrum.id) {
        const request = await fetch(
          "https://api-v2-production-a6e6.up.railway.app/mixed-pairs",
        );
        const response = (await request.json()) as {
          pairs: {
            id: `0x${string}`;
            lpApr: number;
          }[];
        };

        const alchemixPools = response.pairs.filter((pool) =>
          [
            "0xfd599db360cd9713657c95df66650a427d213010",
            "0x774b4eefba334d7230de02c02ab390f8d5d17bf1",
            "0xb69d60d0690733c0cc4db1c1aedeeaa308f30328",
            "0xfb4fe921f724f3c7b610a826c827f9f6ecef6886",
            "0x9c99764ad164360cf85eda42fa2f4166b6cba2a4",
            "0xf6052c1d99f32e5710639183201090e21366619c",
          ].includes(pool.id),
        );

        return {
          "Ramses alUSD-FRAX":
            alchemixPools.find(
              (pool) =>
                pool.id === "0xfd599db360cd9713657c95df66650a427d213010",
            )?.lpApr ?? 0,
          "Ramses alUSD-GRAI":
            alchemixPools.find(
              (pool) =>
                pool.id === "0x774b4eefba334d7230de02c02ab390f8d5d17bf1",
            )?.lpApr ?? 0,
          "Ramses alUSD-alETH":
            alchemixPools.find(
              (pool) =>
                pool.id === "0xb69d60d0690733c0cc4db1c1aedeeaa308f30328",
            )?.lpApr ?? 0,
          "Ramses alETH-frxETH":
            alchemixPools.find(
              (pool) =>
                pool.id === "0xfb4fe921f724f3c7b610a826c827f9f6ecef6886",
            )?.lpApr ?? 0,
          "Ramses alETH-ALCX":
            alchemixPools.find(
              (pool) =>
                pool.id === "0x9c99764ad164360cf85eda42fa2f4166b6cba2a4",
            )?.lpApr ?? 0,
          "Ramses alETH-GRAI":
            alchemixPools.find(
              (pool) =>
                pool.id === "0xf6052c1d99f32e5710639183201090e21366619c",
            )?.lpApr ?? 0,
        } as Record<string, number>;
      }
    },
    enabled: chain.id !== optimism.id,
    staleTime: FIVE_MIN_IN_MS,
  });
};

export const useOpExternalFarmsAprs = () => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: optimism.id,
  });

  return useQuery({
    queryKey: [QueryKeys.ExternalFarmsApr, chain.id],
    queryFn: async () => {
      const ethPriceRes = await fetch(
        "https://coins.llama.fi/prices/current/coingecko:ethereum,coingecko:optimism,coingecko:velodrome-finance",
      );
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
      const opPrice = ethPriceData.coins["coingecko:optimism"].price;
      const veloPrice = ethPriceData.coins["coingecko:velodrome-finance"].price;

      const [pools0, pools1] = await publicClient.multicall({
        allowFailure: false,
        contracts: [
          {
            address: "0x5b29e481f663ec2857487567E1383CBdE83fa2f1",
            abi: veloStatsAbi,
            functionName: "all",
            args: [480n, 0n],
          },
          {
            address: "0x5b29e481f663ec2857487567E1383CBdE83fa2f1",
            abi: veloStatsAbi,
            functionName: "all",
            args: [480n, 480n],
          },
        ],
      });
      const pools = pools0.concat(pools1);

      return {
        "Velodrome alUSD-USDC": selectVeloApr({
          pools,
          poolSymbol: "sAMMV2-USDC/alUSD",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alUSD-FRAX": selectVeloApr({
          pools,
          poolSymbol: "sAMMV2-FRAX/alUSD",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alUSD-DOLA": selectVeloApr({
          pools,
          poolSymbol: "sAMMV2-DOLA/alUSD",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alUSD-OP": selectVeloApr({
          pools,
          poolSymbol: "vAMMV2-OP/alUSD",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alETH-WETH": selectVeloApr({
          pools,
          poolSymbol: "sAMMV2-alETH/WETH",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alETH-frxETH": selectVeloApr({
          pools,
          poolSymbol: "sAMMV2-alETH/frxETH",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alETH-OP": selectVeloApr({
          pools,
          poolSymbol: "vAMMV2-alETH/OP",
          veloPrice,
          ethPrice,
          opPrice,
        }),
      } as Record<string, number>;
    },
    enabled: chain.id === optimism.id,
    staleTime: FIVE_MIN_IN_MS,
  });
};

const SECONDS_IN_A_YEAR = 31556926;

const selectVeloApr = ({
  pools,
  poolSymbol,
  veloPrice,
  ethPrice,
  opPrice,
}: {
  pools: {
    symbol: string;
    emissions: bigint;
    reserve0: bigint;
    reserve1: bigint;
  }[];
  poolSymbol: `sAMMV2-${string}/${string}` | `vAMMV2-${string}/${string}`;
  veloPrice: number | undefined;
  ethPrice: number | undefined;
  opPrice: number | undefined;
}) => {
  if (!veloPrice || !opPrice || !ethPrice) return 0;

  const pool = pools.find((pool) => pool.symbol === poolSymbol);
  if (!pool) return 0;

  const emissions =
    +formatEther(pool.emissions) * SECONDS_IN_A_YEAR * veloPrice;

  const [token0, token1] = poolSymbol.split("-")[1].split("/");
  const price0 = token0.includes("ETH")
    ? ethPrice
    : token0 === "OP"
      ? opPrice
      : 1;
  const decimals0 = token0 === "USDC" ? 6 : 18;

  const price1 = token1.includes("ETH")
    ? ethPrice
    : token1 === "OP"
      ? opPrice
      : 1;
  const decimals1 = token1 === "USDC" ? 6 : 18;

  const tvl =
    +formatUnits(pool.reserve0, decimals0) * price0 +
    +formatUnits(pool.reserve1, decimals1) * price1;

  return (emissions / tvl) * 100;
};
