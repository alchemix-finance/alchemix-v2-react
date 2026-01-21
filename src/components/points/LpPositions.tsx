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
          {data && data.length > 0 ? (
            <ul className="list-inside list-disc">
              {data.map((lp) => (
                <li key={lp} className="mb-2">
                  {lp}
                </li>
              ))}
            </ul>
          ) : (
            <p>No liquidity positions found.</p>
          )}
        </div>
      )}
    </div>
  );
};
