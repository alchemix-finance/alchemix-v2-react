import { AprFn } from "@/lib/config/metadataTypes";

const apiUrl = "https://api.frax.finance/v2/frxeth/summary/latest";

export const getFraxApy: AprFn = async () => {
  const query = await fetch(apiUrl);
  const data = (await query.json()) as { sfrxethApr: number };
  return data.sfrxethApr * 0.9;
};
