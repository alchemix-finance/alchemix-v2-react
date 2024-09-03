import { aaveTokenGatewayAbi } from "@/abi/aaveTokenGateway";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { wethGatewayAbi } from "@/abi/wethGateway";
import { useAllowance } from "@/hooks/useAllowance";
import { useChain } from "@/hooks/useChain";
import { Token, Vault } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { parseUnits } from "viem";
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { GAS_ADDRESS, MAX_UINT256_BN } from "@/lib/constants";
import { calculateMinimumOut } from "@/utils/helpers/minAmountWithSlippage";
import { QueryKeys, ScopeKeys } from "../queries/queriesSchema";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { isInputZero } from "@/utils/inputNotZero";
import { invalidateWagmiUseQuery } from "@/utils/helpers/invalidateWagmiUseQuery";

export const useDeposit = ({
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
  const queryClient = useQueryClient();
  const onDepositReceiptCallback = useCallback(() => {
    setAmount("");
    queryClient.invalidateQueries({ queryKey: [QueryKeys.Alchemists] });
    queryClient.invalidateQueries({ queryKey: [QueryKeys.Vaults] });
    queryClient.invalidateQueries({
      predicate: (query) =>
        invalidateWagmiUseQuery({
          query,
          scopeKey: ScopeKeys.TokenInput,
        }),
    });
  }, [queryClient, setAmount]);

  const { address } = useAccount();
  const mutationCallback = useWriteContractMutationCallback();

  const { data: minimumOut } = useReadContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertUnderlyingTokensToYield",
    args: [vault.yieldToken, parseUnits(amount, selectedToken.decimals)],
    query: {
      enabled: !isInputZero(amount),
      select: (amountInYield) => {
        return calculateMinimumOut(amountInYield, parseUnits(slippage, 2));
      },
    },
  });

  const spender =
    selectedToken.address.toLowerCase() === yieldToken.address.toLowerCase() &&
    !!vault.metadata.gateway &&
    !!vault.metadata.yieldTokenOverride
      ? vault.metadata.gateway
      : vault.alchemist.address;

  const {
    approve,
    approveConfig,
    isApprovalNeeded,
    approveUsdtEthConfig,
    isFetching: isFetchingAllowance,
  } = useAllowance({
    amount,
    spender,
    tokenAddress: selectedToken.address,
    decimals: selectedToken.decimals,
  });

  const {
    data: depositGatewayConfig,
    error: depositGatewayError,
    isFetching: isDepositGatewayConfigFetching,
  } = useSimulateContract({
    address: vault.metadata.gateway,
    abi: aaveTokenGatewayAbi,
    functionName: "deposit",
    args: [
      vault.yieldToken,
      parseUnits(amount, selectedToken.decimals),
      address!,
    ],
    query: {
      enabled:
        !!address &&
        isApprovalNeeded === false &&
        selectedToken.address.toLowerCase() ===
          yieldToken.address.toLowerCase() &&
        !!vault.metadata.gateway &&
        !!vault.metadata.yieldTokenOverride,
    },
  });

  const { writeContract: depositGateway, data: depositGatewayHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Deposit",
      }),
    });

  const { data: depositGatewayReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: depositGatewayHash,
  });

  useEffect(() => {
    if (depositGatewayReceipt) {
      onDepositReceiptCallback();
    }
  }, [depositGatewayReceipt, onDepositReceiptCallback]);

  const {
    data: depositAlchemistConfig,
    error: depositAlchemistError,
    isFetching: isDepositAlchemistConfigFetching,
  } = useSimulateContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "deposit",
    args: [vault.address, parseUnits(amount, selectedToken.decimals), address!],
    query: {
      enabled:
        !!address &&
        isApprovalNeeded === false &&
        selectedToken.address.toLowerCase() ===
          yieldToken.address.toLowerCase() &&
        !vault.metadata.gateway &&
        !vault.metadata.yieldTokenOverride,
    },
  });

  const { writeContract: depositAlchemist, data: depositAlchemistHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Deposit",
      }),
    });

  const { data: depositAlchemistReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: depositAlchemistHash,
  });

  useEffect(() => {
    if (depositAlchemistReceipt) {
      onDepositReceiptCallback();
    }
  }, [depositAlchemistReceipt, onDepositReceiptCallback]);

  const {
    data: depositGasConfig,
    error: depositGasError,
    isFetching: isDepositGasConfigFetching,
  } = useSimulateContract({
    address: vault.metadata.wethGateway,
    abi: wethGatewayAbi,
    functionName: "depositUnderlying",
    args: [
      vault.alchemist.address,
      vault.address,
      parseUnits(amount, selectedToken.decimals),
      address!,
      minimumOut ?? MAX_UINT256_BN,
    ],
    value: parseUnits(amount, selectedToken.decimals),
    query: {
      enabled:
        !!address &&
        selectedToken.address === GAS_ADDRESS &&
        !!vault.metadata.wethGateway &&
        minimumOut !== undefined,
    },
  });

  const { writeContract: depositGas, data: depositGasHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Deposit",
    }),
  });

  const { data: depositGasReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: depositGasHash,
  });

  useEffect(() => {
    if (depositGasReceipt) {
      onDepositReceiptCallback();
    }
  }, [depositGasReceipt, onDepositReceiptCallback]);

  const {
    data: depositUnderlyingConfig,
    error: depositUnderlyingError,
    isFetching: isDepositUnderlyingConfigFetching,
  } = useSimulateContract({
    address: vault.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "depositUnderlying",
    args: [
      vault.address,
      parseUnits(amount, selectedToken.decimals),
      address!,
      minimumOut ?? MAX_UINT256_BN,
    ],
    query: {
      enabled:
        !!address &&
        isApprovalNeeded === false &&
        selectedToken.address !== GAS_ADDRESS &&
        selectedToken.address.toLowerCase() !==
          yieldToken.address.toLowerCase() &&
        minimumOut !== undefined,
    },
  });

  const { writeContract: depositUnderlying, data: depositUnderlyingHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Deposit",
      }),
    });

  const { data: depositUnderlyingReceipt } = useWaitForTransactionReceipt({
    chainId: chain.id,
    hash: depositUnderlyingHash,
  });

  useEffect(() => {
    if (depositUnderlyingReceipt) {
      onDepositReceiptCallback();
    }
  }, [depositUnderlyingReceipt, onDepositReceiptCallback]);

  const writeDeposit = useCallback(() => {
    // deposit gateway
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !!vault.metadata.gateway &&
      !!vault.metadata.yieldTokenOverride
    ) {
      if (depositGatewayError) {
        toast.error("Deposit failed", {
          description:
            depositGatewayError.name === "ContractFunctionExecutionError"
              ? depositGatewayError.cause.message
              : depositGatewayError.message,
        });
        return;
      }
      if (depositGatewayConfig) {
        depositGateway(depositGatewayConfig.request);
      } else {
        toast.error("Deposit failed", {
          description:
            "Deposit gateway unknown error. Please notify Alchemix team.",
        });
      }
      return;
    }

    // deposit alchemist
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !vault.metadata.gateway &&
      !vault.metadata.yieldTokenOverride
    ) {
      if (depositAlchemistError) {
        toast.error("Deposit failed", {
          description:
            depositAlchemistError.name === "ContractFunctionExecutionError"
              ? depositAlchemistError.cause.message
              : depositAlchemistError.message,
        });
        return;
      }
      if (depositAlchemistConfig) {
        depositAlchemist(depositAlchemistConfig.request);
      } else {
        toast.error("Deposit failed", {
          description:
            "Deposit gateway unknown error. Please notify Alchemix team.",
        });
      }
      return;
    }

    // deposit gas
    if (selectedToken.address === GAS_ADDRESS) {
      if (depositGasError) {
        toast.error("Deposit failed", {
          description:
            depositGasError.name === "ContractFunctionExecutionError"
              ? depositGasError.cause.message
              : depositGasError.message,
        });
        return;
      }
      if (depositGasConfig) {
        depositGas(depositGasConfig.request);
      } else {
        toast.error("Deposit failed", {
          description:
            "Deposit gateway unknown error. Please notify Alchemix team.",
        });
      }
      return;
    }

    // if depositUnderlyingConfig is available, deposit using alchemist
    if (
      selectedToken.address !== GAS_ADDRESS &&
      selectedToken.address.toLowerCase() !== yieldToken.address.toLowerCase()
    ) {
      if (depositUnderlyingError) {
        toast.error("Deposit failed", {
          description:
            depositUnderlyingError.name === "ContractFunctionExecutionError"
              ? depositUnderlyingError.cause.message
              : depositUnderlyingError.message,
        });
        return;
      }
      if (depositUnderlyingConfig) {
        depositUnderlying(depositUnderlyingConfig.request);
      } else {
        toast.error("Deposit failed", {
          description:
            "Deposit gateway unknown error. Please notify Alchemix team.",
        });
      }
      return;
    }
  }, [
    depositAlchemist,
    depositAlchemistConfig,
    depositAlchemistError,
    depositGas,
    depositGasConfig,
    depositGasError,
    depositGateway,
    depositGatewayConfig,
    depositGatewayError,
    depositUnderlying,
    depositUnderlyingConfig,
    depositUnderlyingError,
    selectedToken.address,
    vault.metadata.gateway,
    vault.metadata.yieldTokenOverride,
    yieldToken.address,
  ]);

  const writeApprove = useCallback(() => {
    if (approveUsdtEthConfig) {
      approve(approveUsdtEthConfig.request);
      return;
    }
    approveConfig?.request && approve(approveConfig.request);
  }, [approve, approveConfig, approveUsdtEthConfig]);

  const isFetching = useMemo(() => {
    if (!amount) return;
    // deposit gateway
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !!vault.metadata.gateway &&
      !!vault.metadata.yieldTokenOverride
    ) {
      return isDepositGatewayConfigFetching || isFetchingAllowance;
    }

    // deposit alchemist
    if (
      selectedToken.address.toLowerCase() ===
        yieldToken.address.toLowerCase() &&
      !vault.metadata.gateway &&
      !vault.metadata.yieldTokenOverride
    ) {
      return isDepositAlchemistConfigFetching;
    }

    // deposit gas
    if (selectedToken.address === GAS_ADDRESS) {
      return isDepositGasConfigFetching;
    }

    // if depositUnderlyingConfig is available, deposit using alchemist
    if (
      selectedToken.address !== GAS_ADDRESS &&
      selectedToken.address.toLowerCase() !== yieldToken.address.toLowerCase()
    ) {
      return isDepositUnderlyingConfigFetching;
    }
  }, [
    amount,
    isDepositAlchemistConfigFetching,
    isDepositGasConfigFetching,
    isDepositGatewayConfigFetching,
    isDepositUnderlyingConfigFetching,
    isFetchingAllowance,
    selectedToken.address,
    vault.metadata.gateway,
    vault.metadata.yieldTokenOverride,
    yieldToken.address,
  ]);

  return { writeDeposit, writeApprove, isApprovalNeeded, isFetching };
};
