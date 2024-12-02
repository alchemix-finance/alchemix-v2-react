// see documentation at https://docs.lido.fi/integrations/api

import { AprFn } from "@/lib/config/metadataTypes";
import { ALCHEMIST_FEE_MULTIPLIER } from "./common";

export const getLidoApy: AprFn = async () => {
  const api = await fetch("https://eth-api.lido.fi/v1/protocol/steth/apr/last");
  const data = await api.json();
  return (data.data.apr as number) * ALCHEMIST_FEE_MULTIPLIER;
};
