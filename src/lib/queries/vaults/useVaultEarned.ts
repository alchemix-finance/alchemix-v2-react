import { useAccount, usePublicClient } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { div, mul, toNumber } from "dnum";

import { Vault } from "@/lib/types";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { ONE_DAY_IN_MS } from "@/lib/constants";
import { useHarvests } from "@/lib/queries/vaults/useHarvests";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useChain } from "@/hooks/useChain";

export const useVaultEarned = ({
  vault,
  harvestsAndBonuses,
}: {
  vault: Vault;
  harvestsAndBonuses: ReturnType<typeof useHarvests>["data"];
}) => {
  const chain = useChain();

  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });

  const { address } = useAccount();

  return useQuery({
    queryKey: [
      QueryKeys.GeneratedEarned,
      chain.id,
      address,
      vault.address,
      harvestsAndBonuses,
    ],
    queryFn: async () => {
      if (!address) throw new Error("No address");
      if (chain.id === 250)
        throw new Error("Generated earned is not supported on this chain");
      if (!harvestsAndBonuses) throw new Error("No harvests and bonuses data");

      let totalEarned = 0;

      for (const harvest of harvestsAndBonuses.harvests) {
        const { blockNumber } = await publicClient.getTransaction({
          hash: harvest.transaction.hash,
        });
        const { totalShares: totalSharesAtBlockNumber } =
          await publicClient.readContract({
            address: vault.alchemist.address,
            abi: alchemistV2Abi,
            functionName: "getYieldTokenParameters",
            args: [vault.address],
            blockNumber,
          });
        const userPositionsAtBlockNumber = await publicClient.readContract({
          address: vault.alchemist.address,
          abi: alchemistV2Abi,
          functionName: "positions",
          args: [address, vault.address],
          blockNumber,
        });
        const userSharesAtBlockNumber = userPositionsAtBlockNumber[0];
        const ratio = div(
          [userSharesAtBlockNumber, 18],
          [totalSharesAtBlockNumber, 18],
        );
        const userHarvested = toNumber(mul(harvest.totalHarvested, ratio));
        totalEarned += userHarvested;
      }

      for (const bonus of harvestsAndBonuses.bonuses) {
        const { blockNumber } = await publicClient.getTransaction({
          hash: bonus.transaction.hash,
        });
        const { totalShares: totalSharesAtBlockNumber } =
          await publicClient.readContract({
            address: vault.alchemist.address,
            abi: alchemistV2Abi,
            functionName: "getYieldTokenParameters",
            args: [vault.address],
            blockNumber,
          });
        const userPositionsAtBlockNumber = await publicClient.readContract({
          address: vault.alchemist.address,
          abi: alchemistV2Abi,
          functionName: "positions",
          args: [address, vault.address],
          blockNumber,
        });
        const userSharesAtBlockNumber = userPositionsAtBlockNumber[0];
        const ratio = div(
          [userSharesAtBlockNumber, 18],
          [totalSharesAtBlockNumber, 18],
        );
        const userHarvested = toNumber(mul(bonus.amount, ratio));
        totalEarned += userHarvested;
      }

      return totalEarned;
    },
    enabled: false,
    staleTime: ONE_DAY_IN_MS,
  });
};
