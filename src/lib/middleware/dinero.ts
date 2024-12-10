import { AprFn } from "@/lib/config/metadataTypes";
import { ALCHEMIST_FEE_MULTIPLIER } from "./common";

export const getDineroApr: AprFn = async () => {
  const api = await fetch("https://dinero.xyz/api/apr");
  const data = (await api.json()) as {
    apxEth: string;
    pxEth: string;
    sDinero: string;
  };
  const apxEthApr = parseFloat(data.apxEth);
  return apxEthApr * ALCHEMIST_FEE_MULTIPLIER;
};
