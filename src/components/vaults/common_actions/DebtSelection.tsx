import { alchemistV2Abi } from "@/abi/alchemistV2";
import { ALCHEMISTS_METADATA } from "@/lib/config/alchemists";
import { SynthAsset } from "@/lib/config/synths";
import { formatEther } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { useChain } from "@/hooks/useChain";
import { formatNumber } from "@/utils/number";
import { cn } from "@/utils/cn";
import { ScopeKeys } from "@/lib/queries/queriesSchema";

export const DebtSelection = ({
  selectedSynthAsset,
  handleSynthAssetChange,
  availableSynthAssets,
}: {
  selectedSynthAsset: SynthAsset;
  handleSynthAssetChange: (value: string) => void;
  availableSynthAssets: SynthAsset[];
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: debts } = useReadContracts({
    allowFailure: false,
    contracts: availableSynthAssets.map(
      (synthAsset) =>
        ({
          address: ALCHEMISTS_METADATA[chain.id][synthAsset],
          abi: alchemistV2Abi,
          chainId: chain.id,
          functionName: "accounts",
          args: [address!],
        }) as const,
    ),
    scopeKey: ScopeKeys.DebtSelection,
    query: {
      select: (accounts) => accounts.map(([debt]) => debt),
      enabled: !!address,
    },
  });

  useWatchQuery({
    scopeKey: ScopeKeys.DebtSelection,
  });

  return (
    <div className="flex items-center gap-4">
      {availableSynthAssets.map((synthAsset, i) => (
        <div
          key={synthAsset}
          className={cn(
            "flex w-full gap-4 rounded-sm border py-2 pl-4 pr-2",
            selectedSynthAsset === synthAsset
              ? "border-green4 hover:cursor-default"
              : "border-grey5inverse opacity-60 hover:cursor-pointer dark:border-grey5",
          )}
          onClick={() => handleSynthAssetChange(synthAsset)}
        >
          <img
            src={`/images/token-icons/${synthAsset}.svg`}
            alt={synthAsset}
            className="h-16 w-16"
          />
          <div className="flex flex-col space-y-2">
            <p className="text-sm opacity-60">{synthAsset} Debt:</p>
            <p className="font-alcxMono text-lg">
              {formatNumber(formatEther(debts?.[i] ?? 0n), {
                decimals: 4,
                allowNegative: false,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
