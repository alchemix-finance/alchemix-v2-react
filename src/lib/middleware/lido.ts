// see documentation at https://docs.lido.fi/integrations/api

import { AprFn } from "@/lib/config/metadataTypes";

export const getLidoApy: AprFn = async () => {
  const api = await fetch("https://eth-api.lido.fi/v1/protocol/steth/apr/last");
  const data = await api.json();
  return (data.data.apr * 0.9) as number;
};
