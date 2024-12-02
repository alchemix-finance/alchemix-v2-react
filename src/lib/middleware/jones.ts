import { AprFn } from "@/lib/config/metadataTypes";
import { ALCHEMIST_FEE_MULTIPLIER } from "./common";

export const getJonesApy: AprFn = async () => {
  const response = await fetch("https://app.jonesdao.io/api/jusdc-apy");
  const data = (await response.json()) as { jusdcApy: number };

  if (data.jusdcApy === undefined || typeof data.jusdcApy !== "number")
    throw new Error("Invalid APY data");

  return data.jusdcApy * ALCHEMIST_FEE_MULTIPLIER;
};
