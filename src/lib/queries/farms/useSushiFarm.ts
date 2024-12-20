import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { useChain } from "@/hooks/useChain";
import { useQuery } from "@tanstack/react-query";
import { formatEther, zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import {
  ALCX_MAINNET_ADDRESS,
  ONE_DAY_IN_MS,
  SUSHI_MAINNET_ADDRESS,
  WETH_ADDRESSES,
} from "@/lib/constants";
import { mainnet } from "viem/chains";
import { SUSHI } from "@/lib/config/farms";
import { uuid } from "@/utils/uuid";
import { sushiPoolAbi } from "@/abi/sushiPool";
import { sushiMasterchefAbi } from "@/abi/sushiMasterchef";
import { sushiOnsenRewarderAbi } from "@/abi/sushiOnsenRewarder";
import { Farm } from "@/lib/types";
import { useGetMultipleTokenPrices } from "@/lib/queries/useTokenPrice";

export const useSushiFarm = () => {
  const chain = useChain();
  const { address = zeroAddress } = useAccount();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  const prices = useGetMultipleTokenPrices([
    WETH_ADDRESSES[mainnet.id] as `0x${string}`,
    ALCX_MAINNET_ADDRESS,
    SUSHI_MAINNET_ADDRESS,
  ]);
  const [{ data: wethPrice }, { data: alcxPrice }, { data: sushiPrice }] =
    prices;

  return useQuery({
    queryKey: [
      QueryKeys.Farms("sushi"),
      chain.id,
      address,
      wethPrice,
      alcxPrice,
      sushiPrice,
    ],
    queryFn: async () => {
      if (chain.id !== mainnet.id)
        throw new Error("Farms are only available on mainnet.");
      if (
        wethPrice === undefined ||
        alcxPrice === undefined ||
        sushiPrice === undefined
      )
        throw new Error("Prices are not ready.");

      const sushiPoolContract = {
        address: SUSHI.pool,
        abi: sushiPoolAbi,
      } as const;
      const sushiMasterchefContract = {
        address: SUSHI.masterchef,
        abi: sushiMasterchefAbi,
      } as const;
      const sushiOnsenRewarderContract = {
        address: SUSHI.onsenRewarder,
        abi: sushiOnsenRewarderAbi,
      } as const;

      // sushi
      const [
        tokenSymbol,
        totalSupply,
        poolTokenBalance,
        rewardsSushi,
        rewardsAlcx,
        [userDeposit], // userRewardDebt is omitted
        totalDeposit,
        sushiPerBlock,
        alcxPerBlock,
        underlying0,
        underlying1,
        [reserve0, reserve1],
      ] = await publicClient.multicall({
        allowFailure: false,
        contracts: [
          {
            ...sushiPoolContract,
            functionName: "symbol",
          },
          {
            ...sushiPoolContract,
            functionName: "totalSupply",
          },
          {
            ...sushiPoolContract,
            functionName: "balanceOf",
            args: [address],
          },
          {
            ...sushiMasterchefContract,
            functionName: "pendingSushi",
            args: [0n, address],
          },
          {
            ...sushiOnsenRewarderContract,
            functionName: "pendingToken",
            args: [0n, address],
          },
          {
            ...sushiMasterchefContract,
            functionName: "userInfo",
            args: [0n, address],
          },
          {
            ...sushiPoolContract,
            functionName: "balanceOf",
            args: [SUSHI.masterchef],
          },
          {
            ...sushiMasterchefContract,
            functionName: "sushiPerBlock",
          },
          {
            ...sushiOnsenRewarderContract,
            functionName: "tokenPerBlock",
          },
          {
            ...sushiPoolContract,
            functionName: "token0",
          },
          {
            ...sushiPoolContract,
            functionName: "token1",
          },
          {
            ...sushiPoolContract,
            functionName: "getReserves",
          },
        ],
      });

      const price0 =
        underlying0.toLowerCase() ===
        (WETH_ADDRESSES[mainnet.id] as `0x${string}`).toLowerCase()
          ? wethPrice
          : alcxPrice;
      const price1 =
        underlying1.toLowerCase() ===
        (WETH_ADDRESSES[mainnet.id] as `0x${string}`).toLowerCase()
          ? wethPrice
          : alcxPrice;
      const reserve0Number = parseFloat(formatEther(reserve0));
      const reserve1Number = parseFloat(formatEther(reserve1));
      const tvl = price0 * reserve0Number + price1 * reserve1Number;

      const sushiPerWeek = parseFloat(formatEther(sushiPerBlock)) * 45000;
      const alcxPerWeek = parseFloat(formatEther(alcxPerBlock)) * 45000;

      const totalSupplyNumber = parseFloat(formatEther(totalSupply));
      const totalDepositNumber = parseFloat(formatEther(totalDeposit));

      const priceSushiLp = tvl / totalSupplyNumber;

      const apy =
        ((sushiPerWeek * sushiPrice * 52 + alcxPerWeek * alcxPrice * 52) /
          (totalDepositNumber * priceSushiLp)) *
        100;

      const farm: Farm = {
        type: "external-sushi",
        uuid: uuid(),
        poolId: Math.floor(Math.random() * 1000),
        rewards: [
          {
            iconName: "alchemix",
            tokenName: "ALCX",
            symbol: "ALCX",
            amount: formatEther(rewardsAlcx),
            tokenAddress: ALCX_MAINNET_ADDRESS,
          },
          {
            iconName: "sushi",
            tokenName: "SUSHI",
            symbol: "SUSHI",
            amount: formatEther(rewardsSushi),
            tokenAddress: SUSHI_MAINNET_ADDRESS,
          },
        ],
        staked: {
          amount: formatEther(userDeposit),
          tokenSymbol: tokenSymbol,
        },
        yield: {
          type: "APY",
          rate: apy.toString(),
        },
        underlyingAddresses: [underlying0, underlying1],
        tokenSymbol,
        poolTokenBalance: formatEther(poolTokenBalance),
        masterChefAddress: SUSHI.masterchef,
        isActive: alcxPerBlock + sushiPerBlock > 0n,
        poolTokenAddress: SUSHI.pool,
        reserves: [formatEther(reserve0), formatEther(reserve1)],
        tvl: tvl.toString(),
        metadata: SUSHI.metadata,
      };

      return farm;
    },
    staleTime: ONE_DAY_IN_MS,
    enabled:
      chain.id === mainnet.id &&
      wethPrice !== undefined &&
      alcxPrice !== undefined &&
      sushiPrice !== undefined,
  });
};
