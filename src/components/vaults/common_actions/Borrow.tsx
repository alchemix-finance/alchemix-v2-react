import { useCallback, useEffect, useMemo, useState } from "react";
import { BorrowInput } from "@/components/common/input/BorrowInput";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { Button } from "@/components/ui/button";
import { useAlchemists } from "@/lib/queries/useAlchemists";
import {
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { WaitForTransactionReceiptTimeoutError, parseUnits } from "viem";
import { toast } from "sonner";
import { useChain } from "@/hooks/useChain";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { useQueryClient } from "@tanstack/react-query";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { ALCHEMISTS_METADATA, SYNTH_ASSETS } from "@/lib/config/alchemists";
import { isInputZero } from "@/utils/inputNotZero";
import { QueryKeys } from "@/lib/queries/queriesSchema";

export const Borrow = () => {
  const queryClient = useQueryClient();
  const addRecentTransaction = useAddRecentTransaction();
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const { address } = useAccount();

  const [amount, setAmount] = useState("");

  const { data: alchemists } = useAlchemists();
  const { data: tokens } = useTokensQuery();

  // In other words availableSynthAssets is the list of debt tokens
  const availableSynthAssets = useMemo(() => {
    const debtTokenAddresses = alchemists?.map(
      (alchemist) => alchemist.debtToken,
    );
    const debtTokens = tokens?.filter((token) =>
      debtTokenAddresses?.includes(token.address),
    );
    return debtTokens;
  }, [alchemists, tokens]);

  const [tokenAddress, setTokenAddress] = useState(
    availableSynthAssets?.[0].address,
  );
  const debtToken = tokens?.find(
    (token) => token.address.toLowerCase() === tokenAddress?.toLowerCase(),
  );

  const alchemistForDebtTokenAddress =
    ALCHEMISTS_METADATA[chain.id][
      debtToken?.symbol === SYNTH_ASSETS.ALETH
        ? SYNTH_ASSETS.ALETH
        : SYNTH_ASSETS.ALUSD
    ];

  const {
    data: borrowConfig,
    error: borrowError,
    isFetching,
  } = useSimulateContract({
    address: alchemistForDebtTokenAddress,
    abi: alchemistV2Abi,
    functionName: "mint",
    args: [parseUnits(amount, debtToken?.decimals ?? 18), address!],
    query: {
      enabled: !!address && !!debtToken && !isInputZero(amount),
    },
  });

  const { writeContract: borrow, data: borrowHash } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        addRecentTransaction({
          hash,
          description: "Borrow",
        });
        const miningPromise = publicClient.waitForTransactionReceipt({
          hash,
        });
        toast.promise(miningPromise, {
          loading: "Borrowing...",
          success: "Borrow confirmed",
          error: (e) => {
            return e instanceof WaitForTransactionReceiptTimeoutError
              ? "We could not confirm your borrow. Please check your wallet."
              : "Borrow failed";
          },
        });
      },
      onError: (error) => {
        toast.error("Borrow failed", {
          description: error.message,
        });
      },
    },
  });

  const { data: borrowReceipt } = useWaitForTransactionReceipt({
    hash: borrowHash,
  });

  useEffect(() => {
    if (borrowReceipt) {
      setAmount("");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Alchemists] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Vaults] });
    }
  }, [borrowReceipt, queryClient]);

  const handleDebtTokenSelect = (value: string) => {
    setAmount("");
    setTokenAddress(value as `0x${string}`);
  };

  const onCtaClick = useCallback(() => {
    if (borrowError) {
      toast.error("Borrow failed", {
        description:
          borrowError.name === "ContractFunctionExecutionError"
            ? borrowError.cause.message
            : borrowError.message,
      });
      return;
    }
    if (borrowConfig) {
      borrow(borrowConfig.request);
    } else {
      toast.error("Borrow failed", {
        description:
          "Borrow failed. Unexpected. Please contract Alchemix team.",
      });
    }
  }, [borrow, borrowConfig, borrowError]);
  return (
    <div className="space-y-2">
      {!availableSynthAssets || (!debtToken && <p>Loading...</p>)}
      {!!availableSynthAssets && !!debtToken && (
        <>
          <Select value={tokenAddress} onValueChange={handleDebtTokenSelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Debt Token">
                {debtToken.symbol}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableSynthAssets &&
                availableSynthAssets.map((token) => (
                  <SelectItem key={token.address} value={token.address}>
                    {token.symbol}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <BorrowInput
            amount={amount}
            setAmount={setAmount}
            debtToken={debtToken}
          />
          <Button
            variant="outline"
            onClick={onCtaClick}
            disabled={isFetching || isInputZero(amount)}
          >
            Borrow
          </Button>
        </>
      )}
    </div>
  );
};
