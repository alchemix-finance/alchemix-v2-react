import { Hex } from "viem";
import { UsePublicClientReturnType } from "wagmi";

import { lsService } from "../localStorage";
import { wagmiConfig } from "./wagmiConfig";
import { chains } from "./chains";

//-- TENDERLY FORK SET UP --//

export const TENDERLY_FORK_CHAIN_ID = lsService.getItem(
  0,
  "tenderlyForkChainId",
);
export const TENDERLY_FORK_RPC = lsService.getItem(0, "tenderlyForkRpc");

const chain = chains.find((chain) => chain.id === TENDERLY_FORK_CHAIN_ID);

export const tenderlyForkChain =
  TENDERLY_FORK_CHAIN_ID && TENDERLY_FORK_RPC && chain
    ? ({
        ...chain,
        rpcUrls: {
          default: {
            http: [TENDERLY_FORK_RPC],
          },
        },
      } as const)
    : undefined;

export const IS_TENDERLY_FORK = !!tenderlyForkChain;

//-- CUSTOM TENDERLY METHODS --//

type TSetBalanceParams = [addresses: Hex[], value: Hex];
type TSetErc20BalanceParams = [erc20: Hex, to: Hex, value: Hex];

export async function tenderlySetBalance({
  client,
  params,
}: {
  client: UsePublicClientReturnType<typeof wagmiConfig>;
  params: TSetBalanceParams;
}) {
  return client.request<{
    method: "tenderly_setBalance";
    Parameters: TSetBalanceParams;
    ReturnType: Hex;
  }>({
    method: "tenderly_setBalance",
    params: params,
  });
}

export async function tenderlySetErc20Balance({
  client,
  params,
}: {
  client: UsePublicClientReturnType<typeof wagmiConfig>;
  params: TSetErc20BalanceParams;
}) {
  return client.request<{
    method: "tenderly_setErc20Balance";
    Parameters: TSetErc20BalanceParams;
    ReturnType: Hex;
  }>({
    method: "tenderly_setErc20Balance",
    params: params,
  });
}
