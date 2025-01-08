import { useQuery } from "@tanstack/react-query";
import { arbitrum, fantom, mainnet, optimism } from "viem/chains";

import { QueryKeys } from "../queriesSchema";
import { Transmuter } from "@/lib/types";
import { ONE_DAY_IN_MS } from "@/lib/constants";
import { useChain } from "@/hooks/useChain";

type TransmuterAprResponse = Record<
  "mainnet" | "optimism" | "arbitrum",
  {
    [key: string]: { timeToTransmute: number; projectedRate: number };
  }
>;

const FILE_NAME = "transmuterRates.json";
const API_KEY = import.meta.env.VITE_PINATA_KEY;

const ID_TO_KEY = {
  [mainnet.id]: "mainnet",
  [optimism.id]: "optimism",
  [arbitrum.id]: "arbitrum",
} as const;

export const useTransmuterApr = ({
  transmuter,
}: {
  transmuter: Transmuter;
}) => {
  const chain = useChain();
  return useQuery({
    queryKey: [QueryKeys.TransmuterApr, chain.id],
    queryFn: async () => {
      if (chain.id === fantom.id) {
        throw new Error("Transmuter APR is not available on Fantom.");
      }

      const responseHash = await fetch(
        `https://api.pinata.cloud/data/pinList?includeCount=false&metadata[name]=${FILE_NAME}&status=pinned&pageLimit=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        },
      );
      const dataHash = await responseHash.json();
      const pinataHash = dataHash.rows[0].ipfs_pin_hash as string;
      const url = `https://ipfs.imimim.info/ipfs/${pinataHash}`;
      const responseData = await fetch(url);
      const data = (await responseData.json()) as TransmuterAprResponse;

      const chainData = data[ID_TO_KEY[chain.id]];

      return chainData;
    },
    select: (data) => data[transmuter.metadata.aprSelector],
    enabled: !!transmuter.metadata.aprSelector && chain.id !== fantom.id,
    staleTime: ONE_DAY_IN_MS,
    retry: false,
  });
};
