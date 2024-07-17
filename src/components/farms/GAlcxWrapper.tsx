import { useCallback, useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import {
  useReadContracts,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  ALCX_MAINNET_ADDRESS,
  G_ALCX_MAINNET_ADDRESS,
  MAX_UINT256,
} from "@/lib/constants";
import { formatEther, parseEther } from "viem";
import { TokenInput } from "../common/input/TokenInput";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { gAlcxAbi } from "@/abi/gAlcx";
import { isInputZero } from "@/utils/inputNotZero";
import { useAllowance } from "@/hooks/useAllowance";
import { toast } from "sonner";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";

export const GAlcsWrapper = () => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const [amount, setAmount] = useState("");
  const [isUnwrap, setIsUnwrap] = useState(false);
  const [isInfiniteApproval, setIsInfiniteApproval] = useState(false);

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
    amount: isInfiniteApproval ? MAX_UINT256 : amount,
    decimals: 18,
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

  const onWrap = useCallback(() => {
    if (isApprovalNeeded) {
      approveConfig && approve(approveConfig.request);
      return;
    }

    if (wrapError) {
      toast.error("Error wrapping ALCX", {
        description:
          wrapError.name === "ContractFunctionExecutionError"
            ? wrapError.cause.message
            : wrapError.message,
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
  }, [approve, approveConfig, isApprovalNeeded, wrap, wrapConfig, wrapError]);

  const onUnwrap = useCallback(() => {
    if (unwrapError) {
      toast.error("Error unwrapping ALCX", {
        description:
          unwrapError.name === "ContractFunctionExecutionError"
            ? unwrapError.cause.message
            : unwrapError.message,
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
  }, [unwrap, unwrapConfig, unwrapError]);

  return (
    <div className="relative w-full rounded border border-grey10inverse bg-grey15inverse">
      <div className="w-full bg-grey10inverse">
        <p className="text-sm">gALCX Wrapper</p>
      </div>
      <div className="flex flex-col gap-8 p-4 lg:flex-row">
        <div className="flex w-full flex-col space-y-4 rounded border border-grey10inverse bg-grey10inverse p-4">
          <div className="flex flex-row justify-end">
            <div>
              <label className="pr-[15px] leading-none" htmlFor="is-unwrap">
                Wrap
              </label>
              <Switch
                checked={isUnwrap}
                onCheckedChange={handleIsUnwrapChange}
                id="is-unwrap"
              />
              <label className="pl-[15px] leading-none" htmlFor="is-unwrap">
                Unwrap
              </label>
            </div>
          </div>
          <div className="relative flex w-full flex-row">
            <div className="flex w-full justify-end rounded border border-grey3inverse bg-grey3inverse">
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
            <div className="flex w-full rounded bg-grey3inverse p-4 text-center text-xl">
              <p className="w-full self-center text-right text-sm text-lightgrey10">
                {isUnwrap
                  ? `${formatNumber(projectedAlcx)} ALCX`
                  : `${formatNumber(projectedGAlcx)} gALCX`}
              </p>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            <p className="flex-auto text-sm text-lightgrey10inverse">
              Approval
            </p>
            <div>
              <label
                className="pr-[15px] leading-none"
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
                className="pl-[15px] leading-none"
                htmlFor="is-infinite-approval"
              >
                Infinite
              </label>
            </div>
          </div>
          <Button
            disabled={isInputZero(amount)}
            onClick={isUnwrap ? onUnwrap : onWrap}
          >
            {isUnwrap ? "Unwrap" : "Wrap"}
          </Button>
        </div>
        <div className="flex flex-col space-y-4">
          <div className="w-full rounded border-grey10inverse bg-grey10inverse p-4">
            <p className="mb-4">
              A liquid ALCX wrapper for single-sided staking.
            </p>
            <p className="mb-2 text-sm">
              Wrap your ALCX into gALCX and have your ALCX work for you in the
              single sided staking pool while staying in control of your gALCX.
            </p>
            <p className="text-sm">
              Autocompounding increases the amount of ALCX you can unwrap per
              gALCX.
            </p>
          </div>
          <div className="flex w-full flex-col justify-between gap-6 rounded border-grey10inverse bg-grey10inverse p-4 lg:flex-row">
            <div className="flex-col">
              <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
                gALCX Token Supply
              </div>
              <div className="flex">
                <div className="mr-2 flex">{formatNumber(totalSupply)}</div>
              </div>
            </div>
            <div className="flex-col">
              <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
                Wrapped ALCX
              </div>
              <div className="flex">
                <div className="mr-2 flex">{formatNumber(wrappedSupply)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
