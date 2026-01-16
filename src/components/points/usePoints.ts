import { useQuery } from "@tanstack/react-query";

/** Types **/

export interface UserPoints {
  address: string;
  v2_deposits_points: string;
  v3_deposits_points: string;
  lp_points: string;
  referral_points: string;
  last_updated: number;
}

export interface LeaderboardEntry {
  address: string;
  mana: number;
}

export interface PointsBreakdown {
  depositPoints: number;
  migrationPoints: number;
  lpPoints: number;
  totalPoints: number;
}

/** Constants **/

const POINTS_API_BASE =
  import.meta.env.VITE_POINTS_API_URL ?? "http://localhost:3000";

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const STALE_TIME_MINUTES = 5;
const STALE_TIME_MS = MS_PER_SECOND * SECONDS_PER_MINUTE * STALE_TIME_MINUTES;

const DEFAULT_POINTS_BREAKDOWN: PointsBreakdown = {
  depositPoints: 0,
  migrationPoints: 0,
  lpPoints: 0,
  totalPoints: 0,
};

/** Utility Functions **/

const parsePoints = (value: string | undefined) => parseFloat(value || "0");

export const calculateTotalPoints = (entry: UserPoints) =>
  parsePoints(entry.v2_deposits_points) +
  parsePoints(entry.v3_deposits_points) +
  parsePoints(entry.lp_points);

export const getPointsBreakdown = (entry: UserPoints | undefined) => {
  if (!entry) {
    return DEFAULT_POINTS_BREAKDOWN;
  }

  const depositPoints = parsePoints(entry.v2_deposits_points);
  const migrationPoints = parsePoints(entry.v3_deposits_points);
  const lpPoints = parsePoints(entry.lp_points);

  return {
    depositPoints,
    migrationPoints,
    lpPoints,
    totalPoints: depositPoints + migrationPoints + lpPoints,
  };
};

/** API Functions **/

const fetchUserPoints = (address: string) =>
  fetch(`${POINTS_API_BASE}/points/${address.toLowerCase()}`).then((res) => {
    if (!res.ok) throw new Error(`Failed to fetch points for ${address}`);
    return res.json() as Promise<UserPoints>;
  });

const fetchAllPoints = () =>
  fetch(`${POINTS_API_BASE}/points`).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    return res.json() as Promise<UserPoints[]>;
  });

/** Hooks **/

export const useUserPoints = (address: string | undefined) =>
  useQuery({
    queryKey: ["points", "user", address],
    queryFn: () => fetchUserPoints(address!),
    enabled: !!address,
    staleTime: STALE_TIME_MS,
  });

export const useLeaderboard = () =>
  useQuery({
    queryKey: ["points", "leaderboard"],
    queryFn: fetchAllPoints,
    staleTime: STALE_TIME_MS,
    select: (data) =>
      data
        .map((entry) => ({
          address: entry.address,
          mana: calculateTotalPoints(entry),
        }))
        .sort((a, b) => b.mana - a.mana),
  });
