import { useConnection } from "wagmi";

import { LoadingBar } from "@/components/common/LoadingBar";

import { useUserLpData } from "./usePoints";

export const LpPositions = () => {
  const { address } = useConnection();
  const { data, isPending } = useUserLpData(address);
  return (
    <div className="bg-card layered-shadow space-y-12 rounded-xl p-6">
      {!address ? (
        <div>
          <p>Connect your wallet to see accounted liquidity positions.</p>
        </div>
      ) : isPending ? (
        <div className="my-4 flex justify-center">
          <LoadingBar />
        </div>
      ) : (
        <div className="my-4">
          {data && (data.lpNames.length > 0 || data.hasClHistory) ? (
            <ul className="list-inside list-disc">
              {data.lpNames.map((lp) => (
                <li key={lp} className="mb-2">
                  {lp}
                </li>
              ))}
              {data.hasClHistory && (
                <li key="cl-history" className="mb-2">
                  Concentrated Liquidity Positions
                </li>
              )}
            </ul>
          ) : (
            <p>No liquidity positions found.</p>
          )}
        </div>
      )}
    </div>
  );
};
