import { toNumber } from "dnum";

import { AprFn } from "@/lib/config/metadataTypes";

export const getGearboxApy: AprFn = async ({ vaultAddress, publicClient }) => {
  const poolContract = {
    address: vaultAddress,
    abi: [
      {
        inputs: [],
        name: "stakingToken",
        outputs: [
          { internalType: "contract IERC20", name: "", type: "address" },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
  } as const;

  const stakingToken = await publicClient.readContract({
    ...poolContract,
    functionName: "stakingToken",
  });

  const rateBigInt = await publicClient.readContract({
    address: stakingToken,
    abi: [
      {
        inputs: [],
        name: "supplyRate",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "supplyRate",
  });

  return toNumber([rateBigInt, 25]);
};
