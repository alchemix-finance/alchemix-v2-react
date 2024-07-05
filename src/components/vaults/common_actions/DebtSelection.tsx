import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useChain } from "@/hooks/useChain";
import { ALCHEMISTS_METADATA } from "@/lib/config/alchemists";
import { SynthAsset } from "@/lib/config/synths";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { formatEther } from "viem";
import { useAccount, useReadContracts, useReadContract } from "wagmi";
import { useWatchQueryKey } from "@/hooks/useWatchQueryKey";

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

  const { data: accounts } = useReadContracts({
    allowFailure: false,
    contracts: availableSynthAssets.map(
      (synthAsset) =>
        ({
          address: ALCHEMISTS_METADATA[chain.id][synthAsset],
          abi: alchemistV2Abi,
          functionName: "accounts",
          args: [address!],
          query: {
            enabled: !!address,
          },
        }) as const,
    ),
  });
  const debts = accounts?.map((account) => (account[0] < 0 ? 0n : account[0]));

  const { data: debt, queryKey: debtQueryKey } = useReadContract({
    address: ALCHEMISTS_METADATA[chain.id][selectedSynthAsset],
    abi: alchemistV2Abi,
    functionName: "accounts",
    args: [address!],
    query: {
      enabled: !!address,
      select: ([debt]) => (debt < 0 ? 0n : debt),
    },
  });

  useWatchQueryKey(debtQueryKey);

  return (
    <div className="flex items-center gap-2">
      <p>Choose what to repay:</p>
      <Select value={selectedSynthAsset} onValueChange={handleSynthAssetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Synth">
            {formatEther(debt ?? 0n)} {selectedSynthAsset}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableSynthAssets &&
            availableSynthAssets.map((synthAsset, i) => (
              <SelectItem key={synthAsset} value={synthAsset}>
                {formatEther(debts?.[i] ?? 0n)} {synthAsset}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  );
};
