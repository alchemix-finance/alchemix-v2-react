import { fantom, mainnet, optimism } from "viem/chains";
import { formatEther, formatUnits } from "viem";
import { rewardRouterAbi } from "@/abi/rewardRouter";
import {
  BONUS_REWARDS_END_TIMESTAMPS,
  REWARD_ROUTER_ADDRESSES,
  REWARD_TOKENS,
} from "@/lib/config/rewardRouterAddresses";
import { BonusFn } from "@/lib/config/metadataTypes";
import { getAaveReserves } from "./aave";
import { getVesperReserves } from "./vesper";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { dayjs } from "@/lib/dayjs";
import { queryClient } from "@/components/providers/QueryProvider";
import {
  fetchPriceInEth,
  ethPriceQueryOptions,
} from "../queries/useTokenPrice";

const SPY = 31536000;

export const getAaveBonusData: BonusFn = async ({ chainId, vault }) => {
  if (chainId !== optimism.id)
    throw new Error("Aave bonus not supported on this chain");

  const aaveReserves = await getAaveReserves(chainId);

  const aaveReserve = aaveReserves?.find(
    (reserve) =>
      reserve.underlyingAsset.toLowerCase() ===
        vault.underlyingToken.toLowerCase() &&
      reserve.aToken?.rewards.filter(
        (reward) => reward.emissionsPerSecond !== "0",
      ),
  );

  const ethPrice = await queryClient.ensureQueryData(ethPriceQueryOptions);

  const bonusYieldValue = await fetchPriceInEth({
    chainId,
    tokenAddress: "0x4200000000000000000000000000000000000042",
    ethPrice,
  });
  const bonusYieldTokenSymbol = "OP";
  const tokenPriceInEth = await fetchPriceInEth({
    chainId,
    tokenAddress: vault.underlyingToken,
    ethPrice,
  });

  const emissionsPerSecond =
    aaveReserve?.aToken?.rewards[0].emissionsPerSecond ?? "0";
  let bonusYieldRate =
    (+emissionsPerSecond * SPY * bonusYieldValue) /
    (+(aaveReserve?.totalATokenSupply ?? "0") * tokenPriceInEth);

  const chain_decimals = aaveReserve?.decimals ?? 18;

  if (chain_decimals === 6) {
    bonusYieldRate = +formatUnits(BigInt(bonusYieldRate.toFixed()), 12);
  }

  return {
    hasBonus: true,
    bonusTimeLimit: false,
    distributionTimeAmount: "0",
    distributionTimeUnit: "",
    bonusYieldRate,
    bonusYieldTokenSymbol,
  };
};

export const getVesperBonusData: BonusFn = async ({ vault }) => {
  const vesperReserves = await getVesperReserves();

  const vesperVault = vesperReserves.find(
    (reserve) => reserve.address.toLowerCase() === vault.address.toLowerCase(),
  );
  const bonusYieldTokenSymbol = "VSP";
  const bonusYieldRate = vesperVault?.tokenDeltaRates?.["30"] ?? 0;
  const hasBonus = true;
  return {
    hasBonus,
    bonusTimeLimit: false,
    distributionTimeAmount: "0",
    distributionTimeUnit: "",
    bonusYieldRate,
    bonusYieldTokenSymbol,
  };
};

export const getMeltedRewardsBonusData: BonusFn = async ({
  chainId,
  vault,
  tokens,
  publicClient,
}) => {
  if (chainId === fantom.id || chainId === mainnet.id)
    throw new Error("Melted Rewards not supported on Fantom");

  if (!tokens) throw new Error("Tokens not ready");

  // [rewardCollectorAddress, rewardToken, rewardAmount, rewardTimeframe, lastRewardTimestamp]
  const [, , rewardAmount, rewardTimeframe] = await publicClient.readContract({
    address: REWARD_ROUTER_ADDRESSES[chainId],
    abi: rewardRouterAbi,
    functionName: "getRewardCollector",
    args: [vault.address],
  });

  const bonusYieldTokenSymbol = REWARD_TOKENS[chainId].rewardTokenSymbol;
  const bonusTimeLimit = true;

  const rewardEndTimestamp =
    BONUS_REWARDS_END_TIMESTAMPS[chainId][vault.address];

  if (!rewardEndTimestamp)
    throw new Error(
      `Reward end timestamp is not set up for ${vault.metadata.label}`,
    );

  const rewardEnd = dayjs.unix(
    BONUS_REWARDS_END_TIMESTAMPS[chainId][vault.address],
  );
  const distributionTimeAmount = rewardEnd.diff(dayjs(), "days");

  const distributionTimeUnit = distributionTimeAmount > 1 ? "days" : "day";

  const ethPrice = await queryClient.ensureQueryData(ethPriceQueryOptions);

  const bonusYieldValue = await fetchPriceInEth({
    chainId,
    tokenAddress: REWARD_TOKENS[chainId].rewardTokenAddress,
    ethPrice,
  });
  const tokenPriceInEth = await fetchPriceInEth({
    chainId,
    tokenAddress: vault.underlyingToken,
    ethPrice,
  });

  let bonusYieldRate = 0;

  if (rewardAmount > 0n && distributionTimeAmount > 0) {
    const vaultUnderlyingTokenData = tokens.find(
      (token) =>
        token.address.toLowerCase() === vault.underlyingToken.toLowerCase(),
    )!;

    const tvl = await publicClient.readContract({
      address: vault.alchemist.address,
      abi: alchemistV2Abi,
      functionName: "convertSharesToUnderlyingTokens",
      args: [vault.yieldToken, vault.yieldTokenParams.totalShares],
    });

    bonusYieldRate =
      (parseFloat(formatEther(rewardAmount)) * bonusYieldValue * 31556952) /
      parseFloat(rewardTimeframe.toString()) /
      (parseFloat(formatUnits(tvl, vaultUnderlyingTokenData.decimals)) *
        tokenPriceInEth);

    return {
      hasBonus: true,
      bonusTimeLimit,
      distributionTimeAmount: distributionTimeAmount.toString(),
      distributionTimeUnit,
      bonusYieldRate: bonusYieldRate * 100,
      bonusYieldTokenSymbol,
    };
  } else {
    return {
      hasBonus: false,
      bonusTimeLimit: false,
      distributionTimeAmount: "0",
      distributionTimeUnit: "",
      bonusYieldRate,
      bonusYieldTokenSymbol,
    };
  }
};

export const getNoBonus: BonusFn = async () => ({
  hasBonus: false,
  bonusTimeLimit: false,
  distributionTimeAmount: "0",
  distributionTimeUnit: "",
  bonusYieldRate: 0,
  bonusYieldTokenSymbol: "",
});
