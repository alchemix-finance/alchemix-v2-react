import { aaveTokenGatewayAbi } from "@/abi/aaveTokenGateway";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useChain } from "@/hooks/useChain";
import { Token, Vault } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { GAS_ADDRESS, MAX_UINT256_BN } from "@/lib/constants";
import { wethGatewayAbi } from "@/abi/wethGateway";
import { calculateMinimumOut } from "@/utils/helpers/minAmountWithSlippage";
import { QueryKeys, ScopeKeys } from "@/lib/queries/queriesSchema";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { isInputZero } from "@/utils/inputNotZero";
import { useStaticTokenAdapterWithdraw } from "@/hooks/useStaticTokenAdapterWithdraw";
import { invalidateWagmiUseQueryPredicate } from "@/utils/helpers/invalidateWagmiUseQueryPredicate";

export const useWithdraw = ({
  vault,
  amount,
  selectedToken,
  slippage,
  yieldToken,
  setAmount,
  isSelectedTokenYieldToken,
}: {
  amount: string;
  slippage: string;
  vault: Vault;
  selectedToken: Token;
  yieldToken: Token;
  setAmount: (amount: string) => void;
  isSelectedTokenYieldToken: boolean;
}) => {
  const chain = useChain();
  const queryClient = useQueryClient();
  const onWithdrawReceiptCallback = useCallback(() => {
    setAmount("");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.Alchemists] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.Vaults] });
    queryClient.invalidateQueries({
      predicate: (query) =>
        invalidateWagmiUseQueryPredicate({
          query,
          scopeKey: ScopeKeys.VaultWithdrawInput,
        }),
    });
  }, [queryClient, setAmount]);
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  const { aaveAdjustedAmount } = useStaticTokenAdapterWithdraw({
    typeGuard: "adjustedAmount",
    amount,
    vault,
    isSelectedTokenYieldToken,
  });

  const withdrawAmount =
    vault.metadata.api.provider === "aave" &&
    isSelectedTokenYieldToken &&
    !!vault.metadata.yieldTokenOverride
      ? aaveAdjustedAmount
      : parseUnits(amount, selectedToken.decimals);

  const { data: sharesFromYieldToken } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertYieldTokensToShares",
    args: [vault.yieldToken, withdrawAmount ?? 0n],
    query: {
      enabled: isSelectedTokenYieldToken && !isInputZero(amount),
    },
  });

  const { data: sharesFromUnderlyingToken } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertUnderlyingTokensToShares",
    args: [vault.yieldToken, parseUnits(amount, selectedToken.decimals)],
    query: {
      enabled: !isSelectedTokenYieldToken && !isInputZero(amount),
    },
  });

  const shares = isSelectedTokenYieldToken
    ? sharesFromYieldToken
    : sharesFromUnderlyingToken;

  const minimumOutUnderlying = !isSelectedTokenYieldToken
    ? calculateMinimumOut(
        parseUnits(amount, selectedToken.decimals),
        parseUnits(slippage, 2),
      )
    : undefined;

  const {
    data: isApprovalNeededAaveGateway,
    queryKey: isApprovalNeededAaveGatewayQueryKey,
    isPending: isPendingApprovalAaveGateway,
    isFetching: isFetchingApprovalAaveGateway,
  } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "withdrawAllowance",
    args: [address!, vault.metadata.gateway!, vault.yieldToken],
    scopeKey: selectedToken.address,
    query: {
      enabled:
        shares !== undefined &&
        !!address &&
        selectedToken.address.toLowerCase() ===
          yieldToken.address.toLowerCase() &&
        !!vault.metadata.gateway &&
        !!vault.metadata.yieldTokenOverride,
      select: (allowance) => shares !== undefined && allowance < shares,
    },
  });
  const {
    data: isApprovalNeededWethGateway,
    queryKey: isApprovalNeededWethGatewayQueryKey,
    isPending: isPendingApprovalWethGateway,
    isFetching: isFetchingApprovalWethGateway,
  } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "withdrawAllowance",
    args: [address!, vault.metadata.wethGateway!, vault.address],
    scopeKey: selectedToken.address,
    query: {
      enabled:
        shares !== undefined &&
        !!address &&
        !!vault.metadata.wethGateway &&
        selectedToken.address === GAS_ADDRESS,
      select: (allowance) => shares !== undefined && allowance < shares,
    },
  });

  const { data: approveAaveGatewayConfig } = useSimulateContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "approveWithdraw",
    args: [vault.metadata.gateway!, vault.yieldToken, shares ?? 0n],
    query: {
      enabled:
        shares !== undefined &&
        isApprovalNeededAaveGateway === true &&
        !!vault.metadata.gateway &&
        !!vault.metadata.yieldTokenOverride,
    },
  });
  const { data: approveWethGatewayConfig } = useSimulateContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "approveWithdraw",
    args: [vault.metadata.wethGateway!, vault.address, shares ?? 0n],
    query: {
      enabled:
        shares !== undefined &&
        isApprovalNeededWethGateway === true &&
        !!vault.metadata.wethGateway &&
        selectedToken.address === GAS_ADDRESS,
    },
  });

  const {
    writeContract: approve,
    data: approveHash,
    reset: resetApprove,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Approve",
    }),
  });
  const { data: approvalReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: approveHash,
  });
  useEffect(() => {
    if (approvalReceipt) {
      queryClient.invalidateQueries({
        queryKey: isApprovalNeededAaveGatewayQueryKey,
      });
      queryClient.invalidateQueries({
        queryKey: isApprovalNeededWethGatewayQueryKey,
      });
      resetApprove();
    }
  }, [
    approvalReceipt,
    isApprovalNeededAaveGatewayQueryKey,
    isApprovalNeededWethGatewayQueryKey,
    resetApprove,
    queryClient,
  ]);

  const {
    data: withdrawGatewayConfig,
    error: withdrawGatewayError,
    isPending: isWithdrawGatewayConfigPending,
  } = useSimulateContract({
    address: vault.metadata.gateway,
    abi: aaveTokenGatewayAbi,
    functionName: "withdraw",
    args: [vault.yieldToken, shares ?? 0n, address!],
    query: {
      enabled:
        shares !== undefined &&
        !!address &&
        isApprovalNeededAaveGateway === false &&
        selectedToken.address.toLowerCase() ===
          yieldToken.address.toLowerCase() &&
        !!vault.metadata.gateway &&
        !!vault.metadata.yieldTokenOverride,
    },
  });

  const { writeContract: withdrawGateway, data: withdrawGatewayHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Withdraw",
      }),
    });

  const { data: withdrawGatewayReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: withdrawGatewayHash,
  });

  useEffect(() => {
    if (withdrawGatewayReceipt) {
      onWithdrawReceiptCallback();
    }
  }, [withdrawGatewayReceipt, onWithdrawReceiptCallback]);

  const {
    data: withdrawAlchemistConfig,
    error: withdrawAlchemistError,
    isPending: isWithdrawAlchemistConfigPending,
  } = useSimulateContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "withdraw",
    args: [vault.address, shares ?? 0n, address!],
    query: {
      enabled:
        shares !== undefined &&
        !!address &&
        selectedToken.address.toLowerCase() ===
          yieldToken.address.toLowerCase() &&
        !vault.metadata.gateway &&
        !vault.metadata.yieldTokenOverride,
    },
  });

  const { writeContract: withdrawAlchemist, data: withdrawAlchemistHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Withdraw",
      }),
    });

  const { data: withdrawAlchemistReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: withdrawAlchemistHash,
  });

  useEffect(() => {
    if (withdrawAlchemistReceipt) {
      onWithdrawReceiptCallback();
    }
  }, [withdrawAlchemistReceipt, onWithdrawReceiptCallback]);

  const {
    data: withdrawGasConfig,
    error: withdrawGasError,
    isPending: isWithdrawGasConfigPending,
  } = useSimulateContract({
    address: vault.metadata.wethGateway,
    abi: wethGatewayAbi,
    functionName: "withdrawUnderlying",
    args: [
      vault.alchemist.address,
      vault.address,
      shares ?? 0n,
      address!,
      minimumOutUnderlying ?? MAX_UINT256_BN,
    ],
    query: {
      enabled:
        minimumOutUnderlying !== undefined &&
        shares !== undefined &&
        !!address &&
        isApprovalNeededWethGateway === false &&
        selectedToken.address === GAS_ADDRESS &&
        !!vault.metadata.wethGateway,
    },
  });

  const { writeContract: withdrawGas, data: withdrawGasHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Withdraw",
      }),
    });

  const { data: withdrawGasReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: withdrawGasHash,
  });

  useEffect(() => {
    if (withdrawGasReceipt) {
      onWithdrawReceiptCallback();
    }
  }, [withdrawGasReceipt, onWithdrawReceiptCallback]);

  const {
    data: withdrawUnderlyingConfig,
    error: withdrawUnderlyingError,
    isPending: isWithdrawUnderlyingConfigPending,
  } = useSimulateContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "withdrawUnderlying",
    args: [
      vault.address,
      shares ?? 0n,
      address!,
      minimumOutUnderlying ?? MAX_UINT256_BN,
    ],
    query: {
      enabled:
        minimumOutUnderlying !== undefined &&
        shares !== undefined &&
        !!address &&
        selectedToken.address !== GAS_ADDRESS &&
        selectedToken.address.toLowerCase() !==
          yieldToken.address.toLowerCase(),
    },
  });

  const { writeContract: withdrawUnderlying, data: withdrawUnderlyingHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Withdraw",
      }),
    });

  const { data: withdrawUnderlyingReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: withdrawUnderlyingHash,
  });

  useEffect(() => {
    if (withdrawUnderlyingReceipt) {
      onWithdrawReceiptCallback();
    }
  }, [withdrawUnderlyingReceipt, onWithdrawReceiptCallback]);

  const isApprovalNeeded =
    isApprovalNeededAaveGateway === true ||
    isApprovalNeededWethGateway === true;

  const writeApprove = useCallback(() => {
    if (approveAaveGatewayConfig) {
      approve(approveAaveGatewayConfig.request);
      return;
    }
    if (approveWethGatewayConfig) {
      approve(approveWethGatewayConfig.request);
    }
  }, [approve, approveAaveGatewayConfig, approveWethGatewayConfig]);

  const writeWithdraw = useCallback(() => {
    // gateway
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !!vault.metadata.gateway &&
      !!vault.metadata.yieldTokenOverride
    ) {
      if (withdrawGatewayError) {
        toast.error("Withdraw failed", {
          description:
            withdrawGatewayError.name === "ContractFunctionExecutionError"
              ? withdrawGatewayError.cause.message
              : withdrawGatewayError.message,
        });
        return;
      }
      if (withdrawGatewayConfig) {
        withdrawGateway(withdrawGatewayConfig.request);
      } else {
        toast.error("Withdraw failed", {
          description:
            "Withdraw failed. Unknown error. Please notify Alchemix team.",
        });
      }
    }

    // alchemist
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !vault.metadata.gateway &&
      !vault.metadata.yieldTokenOverride
    ) {
      if (withdrawAlchemistError) {
        toast.error("Withdraw failed", {
          description:
            withdrawAlchemistError.name === "ContractFunctionExecutionError"
              ? withdrawAlchemistError.cause.message
              : withdrawAlchemistError.message,
        });
        return;
      }
      if (withdrawAlchemistConfig) {
        withdrawAlchemist(withdrawAlchemistConfig.request);
      } else {
        toast.error("Withdraw failed", {
          description:
            "Withdraw failed. Unknown error. Please notify Alchemix team.",
        });
      }
      return;
    }

    // gas
    if (selectedToken.address === GAS_ADDRESS && !!vault.metadata.wethGateway) {
      if (withdrawGasError) {
        toast.error("Withdraw failed", {
          description:
            withdrawGasError.name === "ContractFunctionExecutionError"
              ? withdrawGasError.cause.message
              : withdrawGasError.message,
        });
        return;
      }
      if (withdrawGasConfig) {
        withdrawGas(withdrawGasConfig.request);
      } else {
        toast.error("Withdraw failed", {
          description:
            "Withdraw failed. Unknown error. Please notify Alchemix team.",
        });
      }
      return;
    }

    // underlying
    if (
      selectedToken.address !== GAS_ADDRESS &&
      selectedToken.address.toLowerCase() !== yieldToken.address.toLowerCase()
    ) {
      if (withdrawUnderlyingError) {
        toast.error("Withdraw failed", {
          description:
            withdrawUnderlyingError.name === "ContractFunctionExecutionError"
              ? withdrawUnderlyingError.cause.message
              : withdrawUnderlyingError.message,
        });
        return;
      }
      if (withdrawUnderlyingConfig) {
        withdrawUnderlying(withdrawUnderlyingConfig.request);
      } else {
        toast.error("Withdraw failed", {
          description:
            "Withdraw failed. Unknown error. Please notify Alchemix team.",
        });
      }
      return;
    }
  }, [
    selectedToken.address,
    vault.metadata.gateway,
    vault.metadata.wethGateway,
    vault.metadata.yieldTokenOverride,
    withdrawAlchemist,
    withdrawAlchemistConfig,
    withdrawAlchemistError,
    withdrawGas,
    withdrawGasConfig,
    withdrawGasError,
    withdrawGateway,
    withdrawGatewayConfig,
    withdrawGatewayError,
    withdrawUnderlying,
    withdrawUnderlyingConfig,
    withdrawUnderlyingError,
    yieldToken.address,
  ]);

  const isPending = (() => {
    if (!amount) return;
    // withdraw gateway
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !!vault.metadata.gateway &&
      !!vault.metadata.yieldTokenOverride
    ) {
      if (isApprovalNeededAaveGateway === false) {
        return isWithdrawGatewayConfigPending;
      } else
        return isPendingApprovalAaveGateway || isFetchingApprovalAaveGateway;
    }

    // withdraw alchemist
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !vault.metadata.gateway &&
      !vault.metadata.yieldTokenOverride
    ) {
      return isWithdrawAlchemistConfigPending;
    }

    // withdraw gas
    if (selectedToken.address === GAS_ADDRESS) {
      if (isApprovalNeededWethGateway === false) {
        return isWithdrawGasConfigPending;
      } else
        return isPendingApprovalWethGateway || isFetchingApprovalWethGateway;
    }

    // withdraw underlying
    if (
      selectedToken.address !== GAS_ADDRESS &&
      selectedToken.address.toLowerCase() !== yieldToken.address.toLowerCase()
    ) {
      return isWithdrawUnderlyingConfigPending;
    }
  })();

  return {
    isApprovalNeeded,
    writeApprove,
    writeWithdraw,
    isPending,
  };
};
