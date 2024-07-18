import { useAccount, useReadContracts } from "wagmi";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useChain } from "@/hooks/useChain";
import { zeroAddress } from "viem";
import { ALCHEMISTS_METADATA } from "@/lib/config/alchemists";
import { ONE_DAY_IN_MS } from "@/lib/constants";

export const useSentinel = () => {
  const chain = useChain();

  const { address = zeroAddress } = useAccount();

  const alchemistsMetadata = ALCHEMISTS_METADATA[chain.id];
  const alchemistWithoutZero = [
    alchemistsMetadata.alETH,
    alchemistsMetadata.alUSD,
  ].filter((al) => al !== zeroAddress);

  return useReadContracts({
    allowFailure: false,
    contracts: alchemistWithoutZero.map(
      (alchemist) =>
        ({
          address: alchemist,
          abi: alchemistV2Abi,
          chainId: chain.id,
          functionName: "sentinels",
          args: [address],
        }) as const,
    ),
    query: {
      select: (isSentinels) => isSentinels.some((isSentinel) => !!isSentinel),
      staleTime: ONE_DAY_IN_MS,
    },
  });
};
