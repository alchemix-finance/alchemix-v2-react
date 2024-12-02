import { AprFn } from "@/lib/config/metadataTypes";
import { ALCHEMIST_FEE_MULTIPLIER } from "./common";

const apiUrl = "https://api.frax.finance/v2/frxeth/summary/latest";

export const getFraxApy: AprFn = async () => {
  const query = await fetch(apiUrl);
  const data = (await query.json()) as { sfrxethApr: number };
  return data.sfrxethApr * ALCHEMIST_FEE_MULTIPLIER;
};
