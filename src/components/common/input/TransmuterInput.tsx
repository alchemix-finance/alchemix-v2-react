import { formatEther } from "viem";
import { useAccount, useReadContracts } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { cn } from "@/utils/cn";
import { transmuterV2Abi } from "@/abi/transmuterV2";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import { useChain } from "@/hooks/useChain";

export const TransmuterInput = ({
  amount,
  setAmount,
  transmuterAddress,
  type,
  tokenSymbol,
}: {
  amount: string;
  setAmount: (amount: string) => void;
  transmuterAddress: `0x${string}`;
  type: "Available" | "Claimable";
  tokenSymbol: string;
}) => {
  const chain = useChain();
  const { address } = useAccount();

  const { data: transmuterBalance, queryKey: transmuterBalanceQueryKey } =
    useReadContracts({
      allowFailure: false,
      contracts: [
        {
          address: transmuterAddress,
          abi: transmuterV2Abi,
          functionName: "getUnexchangedBalance",
          args: [address!],
          chainId: chain.id,
        },
        {
          address: transmuterAddress,
          abi: transmuterV2Abi,
          functionName: "getClaimableBalance",
          args: [address!],
          chainId: chain.id,
        },
      ],
      query: {
        enabled: !!address,
        select: (balances) => balances.map((balance) => formatEther(balance)),
      },
    });
  const [unexchangedBalance, claimableBalance] = transmuterBalance ?? [];

  useWatchQuery({
    queryKey: transmuterBalanceQueryKey,
  });

  const setMax = () => {
    if (
      type === "Available" &&
      !!unexchangedBalance &&
      unexchangedBalance !== "0"
    ) {
      return setAmount(unexchangedBalance);
    }
    if (
      type === "Claimable" &&
      !!claimableBalance &&
      claimableBalance !== "0"
    ) {
      setAmount(claimableBalance);
    }
  };

  const balance = type === "Available" ? unexchangedBalance : claimableBalance;

  return (
    <div className="flex flex-col">
      <p
        className={cn(
          "inline-block self-end text-sm font-light text-lightgrey10",
          balance !== "0" && "cursor-pointer",
        )}
        onClick={setMax}
      >
        {type}: {formatNumber(balance)} {tokenSymbol}
      </p>
      <Input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className={cn(
          "mb-2",
          balance !== undefined &&
            +amount > +balance &&
            "text-red-500 ring-2 ring-red-500 focus-visible:ring-red-500",
        )}
      />
    </div>
  );
};
