import { AprFn } from "@/lib/config/metadataTypes";

const apiUrl = "https://api.rocketpool.net/api/mainnet/apr";

type RocketResponse = {
  yearlyAPR: string;
};

export const getRocketApr: AprFn = async () => {
  const api = await fetch(apiUrl);
  const response = (await api.json()) as RocketResponse;
  const totalStake = parseFloat(response.yearlyAPR) * 0.9;
  return totalStake;
};
