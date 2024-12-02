import { AprFn } from "@/lib/config/metadataTypes";
import { ALCHEMIST_FEE_MULTIPLIER } from "./common";

const apiUrl = "https://api.rocketpool.net/api/mainnet/apr";

type RocketResponse = {
  yearlyAPR: string;
};

export const getRocketApr: AprFn = async () => {
  const api = await fetch(apiUrl);
  const response = (await api.json()) as RocketResponse;
  const totalStake = parseFloat(response.yearlyAPR) * ALCHEMIST_FEE_MULTIPLIER;
  return totalStake;
};
