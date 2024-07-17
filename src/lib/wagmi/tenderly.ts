import { mainnet } from "viem/chains";
import { lsService } from "../localStorage";

type TenderlyForkChain = Omit<typeof mainnet, "rpcUrls"> & {
  rpcUrls: {
    readonly default: {
      readonly http: readonly string[];
    };
  };
};

let tenderlyForkChain: TenderlyForkChain | undefined;

const TENDERLY_FORK_RPC = lsService.getItem(mainnet.id, "tenderlyForkRpc");
if (TENDERLY_FORK_RPC) {
  tenderlyForkChain = {
    ...mainnet,
    rpcUrls: {
      default: {
        http: [TENDERLY_FORK_RPC],
      },
    } as const,
  };
}

const IS_TENDERLY_FORK = !!TENDERLY_FORK_RPC;

export { tenderlyForkChain, IS_TENDERLY_FORK };
