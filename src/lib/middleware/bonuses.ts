import { fantom, optimism } from "viem/chains";
import { getTokenPriceInEth } from "@/lib/queries/useTokenPrice";
import { formatEther, formatUnits } from "viem";
import { rewardRouterAbi } from "@/abi/rewardRouter";
import { rewardRouterAddresses } from "@/lib/config/rewardRouterAddresses";
import { BonusFn } from "@/lib/config/metadataTypes";
import { getAaveReserves } from "./aave";
import { getVesperReserves } from "./vesper";
import { VaultHelper } from "@/lib/helpers/vaultHelper";

const SPY = 31536000;

// aaveReserve = getAaveReserveOpt(strategy?.col3.token.address);
//         bonusYieldValue = await getTokenPriceInEth('optimism', '0x4200000000000000000000000000000000000042');
//         bonusYieldToken = 'OP';
//         tokenPriceInEth = await getTokenPriceInEth('optimism', strategy?.col3.token.address);
//         CHAIN_DEC = aaveReserve.decimals;
//         bonusYieldRate =
//           100 *
//           ((aaveReserve.aToken.rewards[0].emissionsPerSecond * SPY * WEI_DEC * bonusYieldValue) /
//             (aaveReserve.totalATokenSupply * tokenPriceInEth * WEI_DEC));
//         if (CHAIN_DEC === 6) bonusYieldRate = bonusYieldRate / 10 ** 12;
//         bonusYield = true;
//         bonusInPercentage = true;
//         break;

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
  const bonusYieldValue = await getTokenPriceInEth({
    chainId,
    tokenAddress: "0x4200000000000000000000000000000000000042",
  });
  const bonusYieldTokenSymbol = "OP";
  const tokenPriceInEth = await getTokenPriceInEth({
    chainId,
    tokenAddress: vault.underlyingToken,
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
  const bonusYieldRate = (vesperVault?.tokenDeltaRates?.["30"] ?? 0) * 100;
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
  if (chainId === fantom.id)
    throw new Error("Melted Rewards not supported on Fantom");

  const meltedRewardParams = await publicClient.readContract({
    address: rewardRouterAddresses[chainId],
    abi: rewardRouterAbi,
    functionName: "getRewardCollector",
    args: [vault.address],
  });

  const bonusYieldTokenSymbol = "OP";
  const bonusTimeLimit = true;

  const distributionTimeAmount = (
    Number(meltedRewardParams[3]) /
    60 /
    60 /
    24
  ).toFixed();
  const distributionTimeUnit =
    parseFloat(distributionTimeAmount) > 1 ? "days" : "day";

  const bonusYieldValue = await getTokenPriceInEth({
    chainId,
    tokenAddress: "0x4200000000000000000000000000000000000042",
  });
  const tokenPriceInEth = await getTokenPriceInEth({
    chainId,
    tokenAddress: vault.underlyingToken,
  });

  let bonusYieldRate = 0;

  if (meltedRewardParams[2] > BigInt(0)) {
    const vaultUnderlyingTokenData = tokens?.find(
      (token) =>
        token.address.toLowerCase() === vault.underlyingToken.toLowerCase(),
    );

    const vaultHelper = new VaultHelper(vault);
    const tvl = vaultHelper.convertSharesToUnderlyingTokens(
      vault.yieldTokenParams.totalShares,
    );

    bonusYieldRate =
      ((parseFloat(formatEther(meltedRewardParams[2])) *
        bonusYieldValue *
        31556952) /
        parseFloat(meltedRewardParams[3].toString()) /
        parseFloat(
          formatUnits(tvl, vaultUnderlyingTokenData?.decimals ?? 18),
        )) *
      tokenPriceInEth;

    return {
      hasBonus: true,
      bonusTimeLimit,
      distributionTimeAmount,
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
