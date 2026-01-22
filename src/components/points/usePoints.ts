import { useQuery } from "@tanstack/react-query";

import { FIVE_MIN_IN_MS } from "@/lib/constants";
import { QueryKeys } from "@/lib/queries/queriesSchema";

/** Types **/

export interface UserPoints {
  address: string;
  v2_deposits_points: string;
  v3_deposits_points: string;
  lp_points: string;
  referral_points: string;
  last_updated: number;
}

const POINTS_API_BASE =
  import.meta.env.VITE_POINTS_API_URL ?? "http://localhost:3000";

export const calculateTotalPoints = (entry: UserPoints) =>
  Number(entry.v2_deposits_points) +
  Number(entry.v3_deposits_points) +
  Number(entry.lp_points);

/** API Functions **/

const fetchUserPoints = async (address: `0x${string}` | undefined) => {
  if (!address) throw new Error("Address is required to fetch user points");
  const req = await fetch(`${POINTS_API_BASE}/points/${address.toLowerCase()}`);
  const res = (await req.json()) as UserPoints;
  return res;
};

const fetchAllPoints = async () => {
  const req = await fetch(`${POINTS_API_BASE}/points`);
  const res = (await req.json()) as UserPoints[];
  return res;
};

const fetchUserLpData = async (address: `0x${string}` | undefined) => {
  if (!address) throw new Error("Address is required to fetch LP data");
  const req = await fetch(
    `${POINTS_API_BASE}/lp_data/${address.toLowerCase()}`,
  );
  const res = (await req.json()) as string[];
  return res;
};

/** Hooks **/
export const MINIMUM_POINTS_THRESHOLD = 1.337;

export const useUserPoints = (address: `0x${string}` | undefined) => {
  return useQuery({
    queryKey: [QueryKeys.UserPoints, address],
    queryFn: () => fetchUserPoints(address!),
    enabled: !!address,
    staleTime: FIVE_MIN_IN_MS,
    select: (data) => {
      const totalPoints = calculateTotalPoints(data);
      return {
        ...data,
        totalPoints,
        isBelowThreshold: totalPoints < MINIMUM_POINTS_THRESHOLD,
      };
    },
  });
};

export const usePoints = () =>
  useQuery({
    queryKey: [QueryKeys.Points],
    queryFn: fetchAllPoints,
    staleTime: FIVE_MIN_IN_MS,
    select: (data) => ({
      sorted: data
        .map((entry) => ({
          address: entry.address,
          mana: calculateTotalPoints(entry),
        }))
        .sort((a, b) => b.mana - a.mana),
      totalPoints: data.reduce(
        (acc, entry) => acc + calculateTotalPoints(entry),
        0,
      ),
    }),
  });

export const useUserLpData = (address: `0x${string}` | undefined) =>
  useQuery({
    queryKey: [QueryKeys.UserLpData, address],
    queryFn: () => fetchUserLpData(address),
    enabled: !!address,
    staleTime: FIVE_MIN_IN_MS,
  });
