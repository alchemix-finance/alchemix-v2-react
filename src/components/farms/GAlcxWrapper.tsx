import { useEffect, useState } from "react";
import {
  useReadContracts,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { toast } from "sonner";
import { EyeOffIcon, EyeIcon } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";

import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { ALCX_MAINNET_ADDRESS, G_ALCX_MAINNET_ADDRESS } from "@/lib/constants";
import { TokenInput } from "@/components/common/input/TokenInput";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { gAlcxAbi } from "@/abi/gAlcx";
import { isInputZero } from "@/utils/inputNotZero";
import { useAllowance } from "@/hooks/useAllowance";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import {
  accordionVariants,
  accordionTransition,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";

export const GAlcsWrapper = () => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [isUnwrap, setIsUnwrap] = useState(false);
  const [isInfiniteApproval, setIsInfiniteApproval] = useState(false);
  const isReducedMotion = useReducedMotion();

  const { data: gAlcxData } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        address: G_ALCX_MAINNET_ADDRESS,
        abi: gAlcxAbi,
        functionName: "totalSupply",
        chainId: chain.id,
      },
      {
        address: G_ALCX_MAINNET_ADDRESS,
        abi: gAlcxAbi,
        functionName: "exchangeRate",
        chainId: chain.id,
      },
    ],
    query: {
      select: ([totalSupply, exchangeRate]) => [
        formatEther(totalSupply),
        formatEther(exchangeRate),
      ],
    },
  });
  const [totalSupply, exchangeRate] = gAlcxData ?? [];
  const wrappedSupply =
    totalSupply !== undefined && exchangeRate !== undefined
      ? +totalSupply * +exchangeRate
      : undefined;
  const projectedGAlcx = +amount / +exchangeRate;
  const projectedAlcx = +amount * +exchangeRate;

  const { isApprovalNeeded, approveConfig, approve } = useAllowance({
    tokenAddress: ALCX_MAINNET_ADDRESS,
    spender: G_ALCX_MAINNET_ADDRESS,
    amount,
    decimals: 18,
    isInfiniteApproval,
  });

  const { data: wrapConfig, error: wrapError } = useSimulateContract({
    address: G_ALCX_MAINNET_ADDRESS,
    abi: gAlcxAbi,
    chainId: chain.id,
    functionName: "stake",
    args: [parseEther(amount)],
    query: {
      enabled: !isInputZero(amount) && isApprovalNeeded === false,
    },
  });
  const { writeContract: wrap, data: wrapHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Wrap",
    }),
  });
  const { data: wrapReceipt } = useWaitForTransactionReceipt({
    hash: wrapHash,
  });
  useEffect(() => {
    if (wrapReceipt) {
      setAmount("");
    }
  }, [wrapReceipt]);

  const { data: unwrapConfig, error: unwrapError } = useSimulateContract({
    address: G_ALCX_MAINNET_ADDRESS,
    abi: gAlcxAbi,
    chainId: chain.id,
    functionName: "unstake",
    args: [parseEther(amount)],
    query: {
      enabled: !isInputZero(amount),
    },
  });
  const { writeContract: unwrap, data: unwrapHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Unwrap",
    }),
  });
  const { data: unwrapReceipt } = useWaitForTransactionReceipt({
    hash: unwrapHash,
  });
  useEffect(() => {
    if (unwrapReceipt) {
      setAmount("");
    }
  }, [unwrapReceipt]);

  const handleIsUnwrapChange = (value: boolean) => {
    setIsUnwrap(value);
    setAmount("");
  };

  const onWrap = () => {
    if (isApprovalNeeded) {
      approveConfig && approve(approveConfig.request);
      return;
    }

    if (wrapError) {
      toast.error("Error wrapping ALCX", {
        description: getToastErrorMessage({ error: wrapError }),
      });
      return;
    }

    if (wrapConfig) {
      wrap(wrapConfig.request);
    } else {
      toast.error("Error wrapping ALCX", {
        description: "Unexpected error. Please contact Alchemix team.",
      });
    }
  };

  const onUnwrap = () => {
    if (unwrapError) {
      toast.error("Error unwrapping ALCX", {
        description: getToastErrorMessage({ error: unwrapError }),
      });
      return;
    }

    if (unwrapConfig) {
      unwrap(unwrapConfig.request);
    } else {
      toast.error("Error unwrapping ALCX", {
        description: "Unexpected error. Please contact Alchemix team.",
      });
    }
  };

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative w-full rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
      <div
        className="flex select-none items-center justify-between bg-grey10inverse px-6 py-4 text-sm hover:cursor-pointer dark:bg-grey10"
        onClick={handleOpen}
      >
        <p className="text-sm">gALCX Wrapper</p>
        <Button variant="action" className="hidden sm:inline-flex">
          {open ? (
            <EyeOffIcon className="h-6 w-6" />
          ) : (
            <EyeIcon className="h-6 w-6" />
          )}
        </Button>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            key="gAlcxWrapper"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={
              isReducedMotion
                ? reducedMotionAccordionVariants
                : accordionVariants
            }
            transition={accordionTransition}
          >
            <div className="flex flex-col gap-8 p-4 lg:flex-row">
              <div className="flex w-full flex-col space-y-4 rounded border border-grey10inverse bg-grey10inverse p-4 dark:border-grey10 dark:bg-grey10">
                <div className="flex flex-row justify-end">
                  <div className="flex items-center">
                    <label
                      className="pr-[15px] text-sm leading-none text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="is-unwrap"
                    >
                      Wrap
                    </label>
                    <Switch
                      checked={isUnwrap}
                      onCheckedChange={handleIsUnwrapChange}
                      id="is-unwrap"
                    />
                    <label
                      className="pl-[15px] text-sm leading-none text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="is-unwrap"
                    >
                      Unwrap
                    </label>
                  </div>
                </div>
                <div className="relative flex w-full flex-row">
                  <div className="flex w-full justify-end rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
                    <TokenInput
                      amount={amount}
                      setAmount={setAmount}
                      tokenAddress={
                        isUnwrap ? G_ALCX_MAINNET_ADDRESS : ALCX_MAINNET_ADDRESS
                      }
                      tokenDecimals={18}
                      tokenSymbol={isUnwrap ? "gALCX" : "ALCX"}
                    />
                  </div>
                </div>
                <div className="flex h-8 flex-row space-x-4">
                  <div className="flex w-full rounded bg-grey3inverse p-4 text-center text-xl dark:bg-grey3">
                    <p className="w-full self-center text-right text-sm text-lightgrey10">
                      {isUnwrap
                        ? `${formatNumber(projectedAlcx)} ALCX`
                        : `${formatNumber(projectedGAlcx)} gALCX`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="flex-auto text-sm text-lightgrey10inverse dark:text-lightgrey10">
                    Approval
                  </p>
                  <div className="flex items-center">
                    <label
                      className="pr-[15px] text-sm leading-none text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="is-infinite-approval"
                    >
                      Fixed
                    </label>
                    <Switch
                      checked={isInfiniteApproval}
                      onCheckedChange={setIsInfiniteApproval}
                      id="is-infinite-approval"
                    />
                    <label
                      className="pl-[15px] text-sm leading-none text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="is-infinite-approval"
                    >
                      Infinite
                    </label>
                  </div>
                </div>
                <Button
                  variant="outline"
                  disabled={isInputZero(amount)}
                  onClick={isUnwrap ? onUnwrap : onWrap}
                >
                  {isUnwrap ? "Unwrap" : "Wrap"}
                </Button>
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div className="w-full rounded border-grey10inverse bg-grey10inverse p-4 dark:border-grey10 dark:bg-grey10">
                  <p className="mb-4">
                    A liquid ALCX wrapper for single-sided staking.
                  </p>
                  <p className="mb-2 text-sm">
                    Wrap your ALCX into gALCX and have your ALCX work for you in
                    the single sided staking pool while staying in control of
                    your gALCX.
                  </p>
                  <p className="text-sm">
                    Autocompounding increases the amount of ALCX you can unwrap
                    per gALCX.
                  </p>
                </div>
                <div className="flex w-full justify-between gap-6 rounded border-grey10inverse bg-grey10inverse p-4 lg:flex-col xl:flex-row dark:border-grey10 dark:bg-grey10">
                  <div className="flex-col">
                    <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
                      gALCX Token Supply
                    </div>
                    <div className="flex">
                      <div className="mr-2 flex">
                        {formatNumber(totalSupply)}
                      </div>
                    </div>
                  </div>
                  <div className="flex-col">
                    <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
                      Wrapped ALCX
                    </div>
                    <div className="flex">
                      <div className="mr-2 flex">
                        {formatNumber(wrappedSupply)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
