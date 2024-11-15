import { AprFn } from "@/lib/config/metadataTypes";

interface VesperReserve {
  address: string;
  actualRates: Record<string, number>;
  tokenDeltaRates: Record<string, number>;
}

export const getVesperReserves = async () => {
  // NOTE: see vite.config.ts
  const url = "/vesper-pools";
  const response = await fetch(url);
  const data = (await response.json()) as VesperReserve[];
  return data;
};

export const processApr = async ({
  vaultAddress,
  vesperReserves,
}: {
  vaultAddress: `0x${string}`;
  vesperReserves: VesperReserve[] | undefined;
}) => {
  if (!vesperReserves) throw new Error("Vesper reserves not ready");

  const reserve = vesperReserves.find(
    (reserve) => reserve.address.toLowerCase() === vaultAddress.toLowerCase(),
  );

  let yieldValue = reserve?.actualRates["30"] ?? 0;
  if (yieldValue < 0) yieldValue = 0;
  return yieldValue;
};

export const getVesperApr: AprFn = async ({ vaultAddress }) => {
  const vesperReserves = await getVesperReserves();
  const apr = await processApr({
    vaultAddress,
    vesperReserves,
  });
  return apr;
};
