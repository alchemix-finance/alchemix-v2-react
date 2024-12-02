// see yearn documentation at https://docs.yearn.finance/developers/api-documentation

import { AprFn } from "@/lib/config/metadataTypes";
import { optimism } from "viem/chains";
import { ALCHEMIST_FEE_MULTIPLIER } from "./common";

export const getYearnApy: AprFn = async ({
  yieldTokenOverride,
  vaultAddress,
  chainId,
}) => {
  // NOTE: yearn doesn't have CORS set up. Using proxy in vite.config.ts
  const url_base = "/yearn-vaults";
  const api = await fetch(
    `${url_base}/${chainId}/vaults/${yieldTokenOverride ?? vaultAddress}`,
  );
  const vaultData = (await api.json()) as {
    apr: { netAPR: number | null; extra: { stakingRewardsAPR: number | null } };
  };
  if (!vaultData.apr.netAPR) return 0;
  if (!vaultData.apr.extra.stakingRewardsAPR)
    return vaultData.apr.netAPR * 100 * 0.9;
  const value =
    chainId === optimism.id
      ? vaultData.apr.netAPR + vaultData.apr.extra.stakingRewardsAPR
      : vaultData.apr.netAPR;

  return value * 100 * ALCHEMIST_FEE_MULTIPLIER;
};
