import { useQuery } from "@tanstack/react-query";

import { dayjs } from "@/lib/dayjs";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { ONE_DAY_IN_MS } from "@/lib/constants";
import { useChain } from "@/hooks/useChain";
import { ALCHEMIST_FEE_MULTIPLIER } from "@/lib/middleware/common";

export const useHistoricApr = () => {
  const chain = useChain();
  return useQuery({
    queryKey: [QueryKeys.HistoricYield, chain.id],
    queryFn: async () => {
      if (chain.id === 250)
        throw new Error("Historic yield data is not supported on this chain");

      const fileName =
        chain.id === 1
          ? "mainnetDailyAprs.csv"
          : chain.id === 10
            ? "optimismDailyAprs.csv"
            : "arbitrumDailyAprs.csv";
      const response = await fetch(
        `https://api.pinata.cloud/data/pinList?includeCount=false&metadata[name]=${fileName}&status=pinned&pageLimit=1`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_KEY}`,
          },
        },
      );
      const data = await response.json();
      const pinataHash = data.rows[0].ipfs_pin_hash as string;
      const url = `https://ipfs.imimim.info/ipfs/${pinataHash}`;
      const responseCsv = await fetch(url);
      const csv = await responseCsv.text();
      const lines = csv.split("\n");
      const parsedData = lines.slice(1).map((line) => {
        const values = line.split(",");
        return {
          name: values[1],
          timestamp: parseInt(values[0]),
          formattedDate: dayjs.unix(parseInt(values[0])).format("MMM D"),
          apr: +values[2] * 100 * ALCHEMIST_FEE_MULTIPLIER,
        };
      });
      return parsedData;
    },
    enabled: chain.id !== 250,
    staleTime: ONE_DAY_IN_MS,
  });
};
