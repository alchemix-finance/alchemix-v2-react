import { useAccount } from "wagmi";
import { mainnet } from "viem/chains";
import { useMemo } from "react";

import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { tenderlyForkChain } from "@/lib/wagmi/tenderly";

const defaultChain = tenderlyForkChain ?? mainnet;

/**
 * Hook to get reading chain.
 * @returns If connected chain supported, returns connected chain, otherwise returns default chain.
 */
export const useChain = () => {
  // use Account returns connected chain
  // if not connected, chain is undefined
  const { chain } = useAccount<typeof wagmiConfig>();

  const chainUnsupported = useChainUnsupported();

  return useMemo(() => {
    if (!chain || chainUnsupported) {
      return defaultChain;
    }
    return chain;
  }, [chain, chainUnsupported]);
};

export const useChainUnsupported = () => {
  const { chain } = useAccount<typeof wagmiConfig>();
  return useMemo(() => {
    if (wagmiConfig.chains.some((c) => c.id === chain?.id)) {
      return false;
    } else {
      return true;
    }
  }, [chain]);
};
