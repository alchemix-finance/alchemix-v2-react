import { aaveTokenGatewayAbi } from "@/abi/aaveTokenGateway";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useChain } from "@/hooks/useChain";
import { Token, Vault } from "@/lib/types";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import {
  usePublicClient,
  useAccount,
  useReadContract,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { GAS_ADDRESS } from "@/lib/constants";
import { wethGatewayAbi } from "@/abi/wethGateway";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { calculateMinimumOut } from "@/utils/helpers/minAmountWithSlippage";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { mutationCallback } from "@/utils/helpers/mutationCallback";

export const useWithdraw = ({
  vault,
  amount,
  selectedToken,
  slippage,
  yieldToken,
  setAmount,
}: {
  amount: string;
  slippage: string;
  vault: Vault;
  selectedToken: Token;
  yieldToken: Token;
  setAmount: (amount: string) => void;
}) => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const queryClient = useQueryClient();
  const onWithdrawReceiptCallback = useCallback(() => {
    setAmount("");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.Alchemists] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.Vaults] });
  }, [queryClient, setAmount]);

  const { address } = useAccount();
  const addRecentTransaction = useAddRecentTransaction();

  const isSelecedTokenYieldToken =
    selectedToken.address.toLowerCase() === yieldToken.address.toLowerCase();

  const { data: sharesFromYieldToken } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertYieldTokensToShares",
    args: [vault.yieldToken, parseUnits(amount, selectedToken.decimals)],
    query: {
      enabled: isSelecedTokenYieldToken,
    },
  });

  const { data: sharesFromUnderlyingToken } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertUnderlyingTokensToShares",
    args: [vault.yieldToken, parseUnits(amount, selectedToken.decimals)],
    query: {
      enabled: !isSelecedTokenYieldToken,
    },
  });

  const shares = isSelecedTokenYieldToken
    ? sharesFromYieldToken
    : sharesFromUnderlyingToken;

  const minimumOut = calculateMinimumOut(shares, parseUnits(slippage, 6));

  const {
    data: isApprovalNeededAaveGateway,
    queryKey: isApprovalNeededAaveGatewayQueryKey,
  } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "withdrawAllowance",
    args: [address!, vault.metadata.gateway!, vault.yieldToken],
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
  } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "withdrawAllowance",
    args: [address!, vault.metadata.wethGateway!, vault.address],
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

  const { writeContract: approve, data: approveHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Approve",
      addRecentTransaction,
      publicClient,
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
    }
  }, [
    approvalReceipt,
    isApprovalNeededAaveGatewayQueryKey,
    isApprovalNeededWethGatewayQueryKey,
    queryClient,
  ]);

  const {
    data: withdrawGatewayConfig,
    error: withdrawGatewayError,
    isFetching: isWithdrawGatewayConfigFetching,
  } = useSimulateContract({
    address: vault.metadata.gateway,
    abi: aaveTokenGatewayAbi,
    functionName: "withdraw",
    args: [vault.yieldToken, shares ?? 0n, address!],
    query: {
      enabled:
        shares !== undefined &&
        !!address &&
        isApprovalNeededAaveGateway !== true &&
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
        addRecentTransaction,
        publicClient,
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
    isFetching: isWithdrawAlchemistConfigFetching,
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
        addRecentTransaction,
        publicClient,
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
    isFetching: isWithdrawGasConfigFetching,
  } = useSimulateContract({
    address: vault.metadata.wethGateway,
    abi: wethGatewayAbi,
    functionName: "withdrawUnderlying",
    args: [
      vault.alchemist.address,
      vault.address,
      shares ?? 0n,
      address!,
      minimumOut,
    ],
    query: {
      enabled:
        shares !== undefined &&
        !!address &&
        isApprovalNeededWethGateway !== true &&
        selectedToken.address === GAS_ADDRESS &&
        !!vault.metadata.wethGateway,
    },
  });

  const { writeContract: withdrawGas, data: withdrawGasHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Withdraw",
        addRecentTransaction,
        publicClient,
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
    isFetching: isWithdrawUnderlyingConfigFetching,
  } = useSimulateContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "withdrawUnderlying",
    args: [vault.address, shares ?? 0n, address!, minimumOut],
    query: {
      enabled:
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
        addRecentTransaction,
        publicClient,
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

  const isFetching = useMemo(() => {
    if (!amount) return;
    // withdraw gateway
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !!vault.metadata.gateway &&
      !!vault.metadata.yieldTokenOverride
    ) {
      return isWithdrawGatewayConfigFetching;
    }

    // withdraw alchemist
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !vault.metadata.gateway &&
      !vault.metadata.yieldTokenOverride
    ) {
      return isWithdrawAlchemistConfigFetching;
    }

    // withdraw gas
    if (selectedToken.address === GAS_ADDRESS) {
      return isWithdrawGasConfigFetching;
    }

    // withdraw underlying
    if (
      selectedToken.address !== GAS_ADDRESS &&
      selectedToken.address.toLowerCase() !== yieldToken.address.toLowerCase()
    ) {
      return isWithdrawUnderlyingConfigFetching;
    }
  }, [
    amount,
    isWithdrawAlchemistConfigFetching,
    isWithdrawGasConfigFetching,
    isWithdrawGatewayConfigFetching,
    isWithdrawUnderlyingConfigFetching,
    selectedToken.address,
    vault.metadata.gateway,
    vault.metadata.yieldTokenOverride,
    yieldToken.address,
  ]);

  return {
    isApprovalNeeded,
    writeApprove,
    writeWithdraw,
    isFetching,
  };
};
