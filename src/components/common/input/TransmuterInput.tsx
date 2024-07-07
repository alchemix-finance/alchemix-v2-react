import { formatEther } from "viem";
import { useAccount, useBlockNumber, useReadContracts } from "wagmi";
import { Input } from "@/components/ui/input";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/utils/cn";
import { transmuterV2Abi } from "@/abi/transmuterV2";

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

  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({
    chainId: chain.id,
    watch: true,
  });

  const { data: transmuterBalance, queryKey: transmuterBalanceQueryKey } =
    useReadContracts({
      allowFailure: false,
      contracts: [
        {
          address: transmuterAddress,
          abi: transmuterV2Abi,
          functionName: "getUnexchangedBalance",
          args: [address!],
        },
        {
          address: transmuterAddress,
          abi: transmuterV2Abi,
          functionName: "getClaimableBalance",
          args: [address!],
        },
      ],
      query: {
        enabled: !!address,
        select: (balances) => balances.map((balance) => formatEther(balance)),
      },
    });
  const [unexchangedBalance, claimableBalance] = transmuterBalance ?? [];

  useEffect(() => {
    if (blockNumber) {
      queryClient.invalidateQueries({ queryKey: transmuterBalanceQueryKey });
    }
  }, [blockNumber, queryClient, transmuterBalanceQueryKey]);

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
          "inline-block self-end text-sm font-light",
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
