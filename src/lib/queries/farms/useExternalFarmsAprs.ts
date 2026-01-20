import { usePublicClient } from "wagmi";
import { gql, request } from "graphql-request";
import { formatEther, formatUnits } from "viem";
import { arbitrum, fantom, mainnet, optimism } from "viem/chains";
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
        const queryV2 = gql`
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
        const queryV3 = gql`
          {
            pool(chainId: 1, id: "277") {
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

        const [responseAuraV2, responseAuraV3] = await Promise.all([
          request<{
            pool: {
              aprs: {
                total: number;
                breakdown: {
                  value: number;
                  name: string;
                }[];
              };
            };
          }>(auraUrl, queryV2),
          request<{
            pool: {
              aprs: {
                total: number;
                breakdown: {
                  value: number;
                  name: string;
                }[];
              };
            };
          }>(auraUrl, queryV3),
        ]);

        const auraAprV2 = responseAuraV2.pool.aprs.total;
        const auraAprV3 = responseAuraV3.pool.aprs.total;

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
          "AURA x Balancer ALCX-WETH": auraAprV2,
          "AURA x Balancer v3 ALCX-WETH": auraAprV3,
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
          "Curve x Convex alUSD-sDOLA":
            responseConvex.apys["factory-stable-ng-320"].baseApy +
            responseConvex.apys["factory-stable-ng-320"].crvApy,
          "Curve x Convex alETH-pxETH":
            responseConvex.apys["factory-stable-ng-268"].baseApy +
            responseConvex.apys["factory-stable-ng-268"].crvApy,
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

      throw new Error("Unsupported chain");
    },
    enabled: chain.id !== optimism.id && chain.id !== fantom.id,
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

      const veloPoolAddresses = [
        "0x124D69DaeDA338b1b31fFC8e429e39c9A991164e", // sAMMV2-USDC/alUSD
        "0xaF03f51DE7a0E62BF061F6Fc3931cF79166B0a29", // sAMMV2-FRAX/alUSD
        "0x67C253eB6C2e69F9E1114aEeAD0DB4FA8F417AC3", // sAMMV2-DOLA/alUSD
        "0x60BE3FB22DDF30C17604b86eC005F6173B1170Aa", // vAMMV2-OP/alUSD
        "0xa1055762336F92b4B8d2eDC032A0Ce45ead6280a", // sAMMV2-alETH/WETH
        "0x1AD06Ca54de04DBe9e2817F4C13eCB406DCbeAf0", // sAMMV2-alETH/frxETH
        "0x03799d6A59624AbDd50f8774D360A64f4FBfdCF5", // sAMMV2-pxETH/alETH
        "0xA5EDb0EF932f7c2f37B8FC75CB01948F6258a4f8", // vAMMV2-alETH/OP
        "0x844bda8c554d3f14c2c068314b294a5b0ed2e0df", // CL200-alETH/alUSD
      ] as const;
      const veloLpSugarAddress = "0xa64db2d254f07977609def75c3a7db3edc72ee1d";
      const [pool0, pool1, pool2, pool3, pool4, pool5, pool6, pool7, pool8] =
        await publicClient.multicall({
          allowFailure: false,
          contracts: [
            {
              address: veloLpSugarAddress,
              abi: veloStatsAbi,
              functionName: "byAddress",
              args: [veloPoolAddresses[0]],
            },
            {
              address: veloLpSugarAddress,
              abi: veloStatsAbi,
              functionName: "byAddress",
              args: [veloPoolAddresses[1]],
            },
            {
              address: veloLpSugarAddress,
              abi: veloStatsAbi,
              functionName: "byAddress",
              args: [veloPoolAddresses[2]],
            },
            {
              address: veloLpSugarAddress,
              abi: veloStatsAbi,
              functionName: "byAddress",
              args: [veloPoolAddresses[3]],
            },
            {
              address: veloLpSugarAddress,
              abi: veloStatsAbi,
              functionName: "byAddress",
              args: [veloPoolAddresses[4]],
            },
            {
              address: veloLpSugarAddress,
              abi: veloStatsAbi,
              functionName: "byAddress",
              args: [veloPoolAddresses[5]],
            },
            {
              address: veloLpSugarAddress,
              abi: veloStatsAbi,
              functionName: "byAddress",
              args: [veloPoolAddresses[6]],
            },
            {
              address: veloLpSugarAddress,
              abi: veloStatsAbi,
              functionName: "byAddress",
              args: [veloPoolAddresses[7]],
            },
            {
              address: veloLpSugarAddress,
              abi: veloStatsAbi,
              functionName: "byAddress",
              args: [veloPoolAddresses[8]],
            },
          ],
        });

      return {
        "Velodrome alUSD-USDC": calculateVeloApr({
          pool: pool0,
          poolSymbol: "sAMMV2-USDC/alUSD",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alUSD-FRAX": calculateVeloApr({
          pool: pool1,
          poolSymbol: "sAMMV2-FRAX/alUSD",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alUSD-DOLA": calculateVeloApr({
          pool: pool2,
          poolSymbol: "sAMMV2-DOLA/alUSD",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alUSD-OP": calculateVeloApr({
          pool: pool3,
          poolSymbol: "vAMMV2-OP/alUSD",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alETH-WETH": calculateVeloApr({
          pool: pool4,
          poolSymbol: "sAMMV2-alETH/WETH",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alETH-frxETH": calculateVeloApr({
          pool: pool5,
          poolSymbol: "sAMMV2-alETH/frxETH",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alETH-pxETH": calculateVeloApr({
          pool: pool6,
          poolSymbol: "sAMMV2-pxETH/alETH",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome alETH-OP": calculateVeloApr({
          pool: pool7,
          poolSymbol: "vAMMV2-alETH/OP",
          veloPrice,
          ethPrice,
          opPrice,
        }),
        "Velodrome CL200-alETH-alUSD": calculateVeloApr({
          pool: pool8,
          poolSymbol: "CL200-alETH/alUSD",
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

const calculateVeloApr = ({
  pool,
  poolSymbol,
  veloPrice,
  ethPrice,
  opPrice,
}: {
  pool: {
    lp: `0x${string}`;
    symbol: string;
    emissions: bigint;
    reserve0: bigint;
    reserve1: bigint;
    staked0: bigint;
    staked1: bigint;
    type: number;
  };
  poolSymbol:
    | `sAMMV2-${string}/${string}`
    | `vAMMV2-${string}/${string}`
    | `CL200-${string}/${string}`;
  veloPrice: number | undefined;
  ethPrice: number | undefined;
  opPrice: number | undefined;
}) => {
  if (!veloPrice || !opPrice || !ethPrice) return 0;

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

  let tvl =
    +formatUnits(pool.reserve0, decimals0) * price0 +
    +formatUnits(pool.reserve1, decimals1) * price1;

  const isCLPool = pool.type > 0;
  if (isCLPool) {
    const stakedValue0 = Number(formatUnits(pool.staked0, decimals0)) * price0;
    const stakedValue1 = Number(formatUnits(pool.staked1, decimals1)) * price1;
    tvl = stakedValue0 + stakedValue1;
  }

  return tvl > 0 ? (emissions / tvl) * 100 : 0;
};
