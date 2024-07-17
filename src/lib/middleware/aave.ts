import { AprFn } from "@/lib/config/metadataTypes";

import { SupportedChainId } from "@/lib/wagmi/wagmiConfig";
import { arbitrum, fantom, mainnet, optimism } from "viem/chains";
import { gql, request } from "graphql-request";

const aaveApiParams = {
  [mainnet.id]: {
    url: "https://gateway-arbitrum.network.thegraph.com/api/b6da9f745ab40e51bfa76f0cb1bc4c82/subgraphs/id/8wR23o1zkS4gpLqLNU4kG3JHYVucqGyopL5utGxP2q1N",
    query: gql`
      {
        reserves {
          name
          underlyingAsset

          liquidityRate
          stableBorrowRate
          variableBorrowRate

          aEmissionPerSecond
          vEmissionPerSecond
          sEmissionPerSecond

          totalATokenSupply
          totalCurrentVariableDebt
        }
      }
    `,
  },
  [optimism.id]: {
    url: "https://gateway-arbitrum.network.thegraph.com/api/b6da9f745ab40e51bfa76f0cb1bc4c82/subgraphs/id/DSfLz8oQBUeU5atALgUFQKMTSYV9mZAVYp4noLSXAfvb",
    query: gql`
      {
        reserves {
          name
          underlyingAsset
          liquidityRate
          stableBorrowRate
          variableBorrowRate
          totalATokenSupply
          totalCurrentVariableDebt
          aToken {
            rewards {
              emissionsPerSecond
            }
          }
          vToken {
            rewards {
              rewardToken
              emissionsPerSecond
            }
          }
          price {
            priceInEth
          }
          decimals
        }
      }
    `,
  },
  [arbitrum.id]: {
    url: "https://gateway-arbitrum.network.thegraph.com/api/b6da9f745ab40e51bfa76f0cb1bc4c82/subgraphs/id/DLuE98kEb5pQNXAcKFQGQgfSQ57Xdou4jnVbAEqMfy3B",
    query: gql`
      {
        reserves {
          name
          underlyingAsset
          liquidityRate
          stableBorrowRate
          variableBorrowRate
          totalATokenSupply
          totalCurrentVariableDebt
          aToken {
            rewards {
              emissionsPerSecond
            }
          }
          vToken {
            rewards {
              rewardToken
              emissionsPerSecond
            }
          }
          price {
            priceInEth
          }
          decimals
        }
      }
    `,
  },
};

interface AaveReserve {
  name: string;
  underlyingAsset: string;

  liquidityRate: string;
  stableBorrowRate: string;
  variableBorrowRate: string;

  aEmissionPerSecond: string;
  vEmissionPerSecond: string;
  sEmissionPerSecond: string;

  totalATokenSupply: string;
  totalCurrentVariableDebt: string;

  aToken?: {
    rewards: {
      rewardToken: string;
      emissionsPerSecond: string;
    }[];
  };

  decimals?: number;
}

export const getAaveReserves = async (chainId: SupportedChainId) => {
  if (chainId === fantom.id) throw new Error("Chain not suppored in Aave Api");

  const { url, query } = aaveApiParams[chainId];

  const response = await request<{
    reserves: AaveReserve[];
  }>(url, query);

  return response.reserves;
};

export const processApr = async ({
  underlyingToken,
  aaveReserves,
}: {
  underlyingToken: `0x${string}`;
  aaveReserves: AaveReserve[] | undefined;
}) => {
  if (!aaveReserves) throw new Error("Aave reserves not ready");

  const reserve = aaveReserves.find(
    (reserve) =>
      reserve.underlyingAsset.toLowerCase() === underlyingToken.toLowerCase() &&
      reserve.aEmissionPerSecond !== "0",
  );

  const ray = 10 ** 27;
  let a = parseFloat(reserve?.liquidityRate || "1") / ray;
  a = a * 0.9;
  const b = a * 100;
  return b;
};

export const getAaveApr: AprFn = async ({ chainId, underlyingToken }) => {
  const aaveReserves = await getAaveReserves(chainId);
  const apr = await processApr({ aaveReserves, underlyingToken });
  return apr;
};
