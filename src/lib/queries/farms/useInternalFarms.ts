import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { useChain } from "@/hooks/useChain";
import { useQuery } from "@tanstack/react-query";
import { erc20Abi, formatEther, zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import {
  ALCX_MAINNET_ADDRESS,
  ONE_DAY_IN_MS,
  WETH_ADDRESSES,
} from "@/lib/constants";
import { mainnet } from "viem/chains";
import {
  INTERNAL_FARMS_METADATA,
  STAKING_POOL_ADDRESSES,
} from "@/lib/config/farms";
import { stakingPoolsAbi } from "@/abi/stakingPools";
import { uuid } from "@/utils/uuid";
import { Farm } from "@/lib/types";
import { useGetMultipleTokenPrices } from "@/lib/queries/useTokenPrice";

export const useInternalFarms = () => {
  const chain = useChain();
  const { address = zeroAddress } = useAccount();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  const prices = useGetMultipleTokenPrices([
    WETH_ADDRESSES[mainnet.id] as `0x${string}`,
    ALCX_MAINNET_ADDRESS,
  ]);
  const [{ data: wethPrice }, { data: alcxPrice }] = prices;

  return useQuery({
    queryKey: [
      QueryKeys.Farms("internal"),
      chain.id,
      address,
      wethPrice,
      alcxPrice,
    ],
    queryFn: async () => {
      if (chain.id !== mainnet.id)
        throw new Error("Farms are only available on mainnet.");

      if (wethPrice === undefined || alcxPrice === undefined)
        throw new Error("Prices are not ready.");

      const stakingPoolsContract = {
        address: STAKING_POOL_ADDRESSES[chain.id],
        abi: stakingPoolsAbi,
      } as const;

      //-- internal farms --//

      const poolCount = await publicClient.readContract({
        ...stakingPoolsContract,
        functionName: "poolCount",
      });
      const range = [...Array(Number(poolCount)).keys()];

      const internalPoolsCalls = range.flatMap(
        (i) =>
          [
            {
              ...stakingPoolsContract,
              functionName: "getPoolToken",
              args: [BigInt(i)],
            },
            {
              ...stakingPoolsContract,
              functionName: "getStakeTotalDeposited",
              args: [address, BigInt(i)],
            },
            {
              ...stakingPoolsContract,
              functionName: "getPoolRewardRate",
              args: [BigInt(i)],
            },
            {
              ...stakingPoolsContract,
              functionName: "getStakeTotalUnclaimed",
              args: [address, BigInt(i)],
            },
            {
              ...stakingPoolsContract,
              functionName: "getPoolTotalDeposited",
              args: [BigInt(i)],
            },
          ] as const,
      );

      const internalPoolsData = await publicClient.multicall({
        allowFailure: false,
        contracts: internalPoolsCalls,
      });

      const poolTokens = internalPoolsData.filter(
        (v) => typeof v === "string",
      ) as `0x${string}`[];
      const symbolsAndBalances = await publicClient.multicall({
        allowFailure: false,
        contracts: poolTokens.flatMap(
          (token) =>
            [
              {
                address: token,
                abi: erc20Abi,
                functionName: "symbol",
              },
              {
                address: token,
                abi: erc20Abi,
                functionName: "balanceOf",
                args: [address],
              },
            ] as const,
        ),
      });

      const internalFarms = range
        .map((i) => {
          const [tokenSymbol, poolTokenBalance] = symbolsAndBalances.slice(
            i * 2,
            i * 2 + 2,
          ) as [string, bigint];

          const [
            poolTokenAddress,
            userDeposited,
            rewardRate,
            userUnclaimed,
            totalDeposited,
          ] = internalPoolsData.slice(i * 5, i * 5 + 5) as [
            `0x${string}`,
            bigint,
            bigint,
            bigint,
            bigint,
          ];

          const metadata = INTERNAL_FARMS_METADATA.find(
            (pool) =>
              pool.address.toLowerCase() === poolTokenAddress.toLowerCase(),
          );

          if (!metadata) return;

          const rewardRateNumber = parseFloat(formatEther(rewardRate));
          const totalDepositedNumber = parseFloat(formatEther(totalDeposited));

          const rewardsPerWeek = rewardRateNumber * 45000;

          const aprSaddle =
            ((rewardRateNumber * 45000 * 52 * alcxPrice) /
              (totalDepositedNumber * wethPrice)) *
            100;

          const aprAlcx =
            ((1 +
              (((rewardsPerWeek * 52) / totalDepositedNumber) * 100) /
                100 /
                100) **
              100 -
              1) *
            100;

          const apy = metadata.tokenIcon === "saddle" ? aprSaddle : aprAlcx;

          const farm: Farm = {
            type: "internal",
            uuid: uuid(),
            poolTokenAddress,
            poolTokenBalance: formatEther(poolTokenBalance),
            rewards: [
              {
                iconName: "alchemix",
                tokenName: "ALCX",
                symbol: "ALCX",
                amount: formatEther(userUnclaimed),
                tokenAddress: ALCX_MAINNET_ADDRESS,
              },
            ],
            tokenSymbol,
            staked: {
              amount: formatEther(userDeposited),
              tokenSymbol: "ALCX",
            },
            isActive: rewardRate > 0n,
            yield: {
              rate: apy.toString(),
              type: "APY",
            },
            reserve: formatEther(totalDeposited),
            metadata,
            poolId: i,
          };

          return farm;
        })
        .filter((f) => !!f) as Farm[];

      return internalFarms;
    },
    staleTime: ONE_DAY_IN_MS,
    enabled:
      chain.id === mainnet.id &&
      wethPrice !== undefined &&
      alcxPrice !== undefined,
  });
};
