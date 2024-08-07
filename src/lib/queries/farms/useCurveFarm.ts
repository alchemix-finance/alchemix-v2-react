import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { useChain } from "@/hooks/useChain";
import { useQuery } from "@tanstack/react-query";
import { erc20Abi, formatEther, zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { QueryKeys } from "../queriesSchema";
import {
  ALCX_MAINNET_ADDRESS,
  CRV_MAINNET_ADDRESS,
  ONE_DAY_IN_MS,
} from "@/lib/constants";
import { mainnet } from "viem/chains";
import { CURVE } from "@/lib/config/farms";
import { uuid } from "@/utils/uuid";
import { curveGaugeAbi } from "@/abi/curveGauge";
import { curveMetapoolAbi } from "@/abi/curveMetapool";
import { curveRewardsAbi } from "@/abi/curveRewards";
import { Farm } from "../../types";

export const useCurveFarm = () => {
  const chain = useChain();
  const { address = zeroAddress } = useAccount();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  return useQuery({
    queryKey: [QueryKeys.Farms("curve"), chain.id, address],
    queryFn: async () => {
      const curveGaugeContract = {
        address: CURVE.gauge,
        abi: curveGaugeAbi,
      } as const;
      const curveMetapoolContract = {
        address: CURVE.metapool,
        abi: curveMetapoolAbi,
      } as const;
      const curveRewardsContract = {
        address: CURVE.rewards,
        abi: curveRewardsAbi,
      } as const;

      const lpToken = await publicClient.readContract({
        ...curveGaugeContract,
        functionName: "lp_token",
      });

      const [
        userDeposit,
        totalSupply,
        virtualPrice,
        rewardToken,
        crvToken,
        poolTokenBalance,
        tokenSymbol,
      ] = await publicClient.multicall({
        allowFailure: false,
        contracts: [
          {
            ...curveGaugeContract,
            functionName: "balanceOf",
            args: [address],
          },
          {
            ...curveGaugeContract,
            functionName: "totalSupply",
          },
          {
            ...curveMetapoolContract,
            functionName: "get_virtual_price",
          },
          {
            ...curveRewardsContract,
            functionName: "rewardsToken",
          },
          {
            ...curveGaugeContract,
            functionName: "crv_token",
          },
          {
            address: lpToken,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [address],
          },
          {
            address: lpToken,
            abi: erc20Abi,
            functionName: "symbol",
          },
        ],
      });

      const [rewardsCrv, rewardsAlcx] = await publicClient.multicall({
        allowFailure: false,
        contracts: [
          {
            ...curveGaugeContract,
            functionName: "claimable_reward",
            args: [address, crvToken],
          },
          {
            ...curveGaugeContract,
            functionName: "claimable_reward",
            args: [address, rewardToken],
          },
        ],
      });

      const farm: Farm = {
        type: "external-curve",
        uuid: uuid(),
        poolId: Math.floor(Math.random() * 1000),
        poolTokenAddress: lpToken,
        staked: {
          amount: formatEther(userDeposit),
          tokenSymbol: tokenSymbol,
        },
        poolTokenBalance: formatEther(poolTokenBalance),
        tokenSymbol,
        isActive: false,
        metapoolAddress: CURVE.metapool,
        tvl: formatEther(totalSupply * virtualPrice),
        rewards: [
          {
            iconName: "alchemix",
            tokenName: "ALCX",
            symbol: "ALCX",
            amount: formatEther(rewardsAlcx),
            tokenAddress: ALCX_MAINNET_ADDRESS,
          },
          {
            iconName: "crv",
            tokenName: "CRV",
            symbol: "CRV",
            amount: formatEther(rewardsCrv),
            tokenAddress: CRV_MAINNET_ADDRESS,
          },
        ],
        yield: {
          type: "APY",
          rate: "0",
        },
        metadata: CURVE.metadata,
      };

      return farm;
    },
    staleTime: ONE_DAY_IN_MS,
    enabled: chain.id === mainnet.id,
  });
};
