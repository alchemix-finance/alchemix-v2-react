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
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { isAddress, parseUnits } from "viem";
import { toast } from "sonner";
import { useChain } from "@/hooks/useChain";
import { useQueryClient } from "@tanstack/react-query";
import { ALCHEMISTS_METADATA, SYNTH_ASSETS } from "@/lib/config/alchemists";
import { isInputZero } from "@/utils/inputNotZero";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { Switch } from "@/components/ui/switch";
import { AnimatePresence, m } from "framer-motion";
import { Input } from "@/components/ui/input";

export const Borrow = () => {
  const queryClient = useQueryClient();
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  const [isDifferentAddress, setIsDifferentAddress] = useState(false);
  const [confirmedDifferentAddress, setConfirmedDifferentAddress] =
    useState(false);
  const [receipientAddress, setReceipientAddress] = useState("");
  const [amount, setAmount] = useState("");

  const receipient = isAddress(receipientAddress) ? receipientAddress : address;

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
    chainId: chain.id,
    functionName: "mint",
    args: [parseUnits(amount, debtToken?.decimals ?? 18), receipient!],
    query: {
      enabled: !!receipient && !!debtToken && !isInputZero(amount),
    },
  });

  const { writeContract: borrow, data: borrowHash } = useWriteContract({
    mutation: mutationCallback({
      action: `Borrow ${debtToken?.symbol}`,
    }),
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

  const handleIsDifferentAddress = (checked: boolean) => {
    setIsDifferentAddress(checked);
  };

  const handleConfirmedDifferentAddress = (checked: boolean) => {
    if (!isAddress(receipientAddress)) {
      toast.error("Invalid address");
      return;
    }
    setConfirmedDifferentAddress(checked);
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
    <div className="space-y-4 bg-grey15inverse p-4 dark:bg-grey15">
      {!availableSynthAssets || (!debtToken && <p>Loading...</p>)}
      {!!availableSynthAssets && !!debtToken && (
        <>
          <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
            <Select value={tokenAddress} onValueChange={handleDebtTokenSelect}>
              <SelectTrigger className="h-auto w-[180px]">
                <SelectValue placeholder="Debt Token" asChild>
                  <div className="flex items-center gap-4">
                    <img
                      src={`/images/token-icons/${debtToken.symbol}.svg`}
                      alt={debtToken.symbol}
                      className="h-12 w-12"
                    />
                    <span className="text-xl">{debtToken.symbol}</span>
                  </div>
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
          </div>
          <div className="flex items-center">
            <Switch
              checked={isDifferentAddress}
              onCheckedChange={handleIsDifferentAddress}
              id="is-different-address"
            />
            <label
              className="cursor-pointer pl-2 text-sm text-lightgrey10inverse dark:text-lightgrey10"
              htmlFor="is-different-address"
            >
              Transfer loan to different wallet
            </label>
          </div>
          <div>
            <AnimatePresence initial={false}>
              {isDifferentAddress && (
                <m.div
                  key="differentAddressInput"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: "auto" },
                    collapsed: { opacity: 0, height: 0 },
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut",
                  }}
                  className="space-y-4"
                >
                  <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
                    <Input
                      type="text"
                      value={receipientAddress}
                      onChange={(e) => setReceipientAddress(e.target.value)}
                      className="relative h-full flex-grow rounded-none p-4 text-right text-xl"
                      placeholder="0x..."
                    />
                    <Button
                      variant="action"
                      weight="normal"
                      className="flex h-auto border-0 bg-grey3inverse text-lightgrey10inverse text-opacity-80 transition-all hover:bg-grey1inverse hover:text-opacity-100 dark:bg-grey3 dark:text-lightgrey10 dark:hover:bg-grey1"
                      onClick={() => setReceipientAddress("")}
                    >
                      CLEAR
                    </Button>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      checked={confirmedDifferentAddress}
                      onCheckedChange={handleConfirmedDifferentAddress}
                      id="confirmed-different-address"
                    />
                    <label
                      className="cursor-pointer pl-2 text-sm text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="confirmed-different-address"
                    >
                      I have verified the above address to be the correct
                      recipient of my new loan
                    </label>
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
          <Button
            variant="outline"
            width="full"
            onClick={onCtaClick}
            disabled={
              isFetching ||
              isInputZero(amount) ||
              (isDifferentAddress && !isAddress(receipientAddress)) ||
              (isDifferentAddress && !confirmedDifferentAddress)
            }
          >
            Borrow {debtToken.symbol}
          </Button>
        </>
      )}
    </div>
  );
};
