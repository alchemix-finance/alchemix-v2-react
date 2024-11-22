import { useCallback, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseUnits } from "viem";
import { arbitrum, fantom, optimism } from "viem/chains";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Vault } from "@/lib/types";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { vaultMigrationToolAbi } from "@/abi/vaultMigrationTool";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { MIGRATORS } from "@/lib/config/migrators";
import { SYNTH_ASSETS } from "@/lib/config/synths";
import { QueryKeys, ScopeKeys } from "@/lib/queries/queriesSchema";
import { MAX_UINT256_BN } from "@/lib/constants";
import { isInputZero } from "@/utils/inputNotZero";
import { invalidateWagmiUseQueryPredicate } from "@/utils/helpers/invalidateWagmiUseQueryPredicate";
import { calculateMinimumOut } from "@/utils/helpers/minAmountWithSlippage";

export const useMigrate = ({
  currentVault,
  selectedVault,
  amount,
  setAmount,
  slippage,
}: {
  amount: string;
  slippage: string;
  setAmount: (amount: string) => void;
  currentVault: Vault;
  selectedVault: Vault;
}) => {
  const queryClient = useQueryClient();
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  if (chain.id === fantom.id || chain.id === arbitrum.id) {
    throw new Error("Migrate is not supported on Fantom or Arbitrum");
  }

  const { data: underlyingTokens } = useReadContract({
    address: currentVault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "convertSharesToUnderlyingTokens",
    args: [
      currentVault.yieldToken,
      parseUnits(amount, currentVault.yieldTokenParams.decimals),
    ],
    query: {
      enabled: !isInputZero(amount),
    },
  });

  const { data: underlyingInDebt } = useReadContract({
    address: currentVault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "normalizeUnderlyingTokensToDebt",
    args: [currentVault.underlyingToken, underlyingTokens ?? 0n],
    query: {
      enabled: underlyingTokens !== undefined,
    },
  });

  const { address } = useAccount();

  const migratorToolAddress =
    MIGRATORS[
      currentVault.alchemist.synthType === SYNTH_ASSETS.ALETH ? "eth" : "usd"
    ][chain.id];

  const { data: migrationParams } = useReadContract({
    address: migratorToolAddress,
    abi: vaultMigrationToolAbi,
    chainId: chain.id,
    functionName: "previewMigration",
    args: [
      address!,
      currentVault.address,
      selectedVault.address,
      parseUnits(amount, currentVault.yieldTokenParams.decimals),
    ],
    query: {
      enabled: !!address,
    },
  });
  // debt skipped
  const [doesMigrationSucceed, reason, , minOrNewShares, minOrNewUnderlying] =
    migrationParams ?? [];

  // new op migrator tool returns not minShares and minUnderlying but newShares and newUnderlying
  let minSharesForSlippage = MAX_UINT256_BN,
    minUnderlyingForSlippage = MAX_UINT256_BN;
  if (
    chain.id === optimism.id &&
    minOrNewShares !== undefined &&
    minOrNewUnderlying !== undefined
  ) {
    minSharesForSlippage = calculateMinimumOut(
      minOrNewShares,
      parseUnits(slippage, 2),
    );
    minUnderlyingForSlippage = calculateMinimumOut(
      minOrNewUnderlying,
      parseUnits(slippage, 2),
    );
  }

  const {
    data: isApprovalNeededWithdraw,
    isPending: isPendingApprovalWithdraw,
    isFetching: isFetchingApprovalWithdraw,
    queryKey: isApprovalNeededWithdrawQueryKey,
  } = useReadContract({
    address: currentVault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "withdrawAllowance",
    args: [address!, migratorToolAddress, currentVault.address],
    query: {
      enabled: !!address,
      select: (allowance) =>
        allowance < parseUnits(amount, currentVault.yieldTokenParams.decimals),
    },
  });

  const {
    data: isApprovalNeededMint,
    isPending: isPendingApprovalMint,
    isFetching: isFetchingApprovalMint,
    queryKey: isApprovalNeededMintQueryKey,
  } = useReadContract({
    address: currentVault.alchemist.address,
    abi: alchemistV2Abi,
    chainId: chain.id,
    functionName: "mintAllowance",
    args: [address!, migratorToolAddress],
    query: {
      enabled: !!address,
      select: (allowance) =>
        allowance === 0n ||
        (underlyingInDebt !== undefined && allowance < underlyingInDebt),
    },
  });

  const { data: approveWithdrawConfig } = useSimulateContract({
    address: currentVault.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "approveWithdraw",
    args: [
      migratorToolAddress,
      currentVault.address,
      parseUnits(amount, currentVault.yieldTokenParams.decimals),
    ],
    query: {
      enabled: isApprovalNeededWithdraw === true,
    },
  });

  const {
    writeContract: writeWithdrawApprovePrepared,
    data: approveWithdrawHash,
    reset: resetApproveWithdraw,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Approve withdraw",
    }),
  });

  const { data: approveWithdrawReceipt } = useWaitForTransactionReceipt({
    hash: approveWithdrawHash,
  });

  useEffect(() => {
    if (approveWithdrawReceipt) {
      queryClient.invalidateQueries({
        queryKey: isApprovalNeededWithdrawQueryKey,
      });
      resetApproveWithdraw();
    }
  }, [
    queryClient,
    resetApproveWithdraw,
    approveWithdrawReceipt,
    isApprovalNeededWithdrawQueryKey,
  ]);

  const { data: approveMintConfig } = useSimulateContract({
    address: currentVault.alchemist.address,
    abi: alchemistV2Abi,
    functionName: "approveMint",
    args: [migratorToolAddress, underlyingInDebt!],
    query: {
      enabled: underlyingInDebt !== undefined && isApprovalNeededMint === true,
    },
  });

  const {
    writeContract: writeMintApprovePrepared,
    data: approveMintHash,
    reset: resetApproveMint,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Approve mint",
    }),
  });

  const { data: approveMintReceipt } = useWaitForTransactionReceipt({
    hash: approveMintHash,
  });

  useEffect(() => {
    if (approveMintReceipt) {
      queryClient.invalidateQueries({
        queryKey: isApprovalNeededMintQueryKey,
      });
      resetApproveMint();
    }
  }, [
    resetApproveMint,
    approveMintReceipt,
    isApprovalNeededMintQueryKey,
    queryClient,
  ]);

  const {
    data: migrateConfig,
    isPending: isPendingConfig,
    error: migrateConfigError,
  } = useSimulateContract({
    address: migratorToolAddress,
    abi: vaultMigrationToolAbi,
    functionName: "migrateVaults",
    args: [
      currentVault.address,
      selectedVault.address,
      parseUnits(amount, currentVault.yieldTokenParams.decimals),
      chain.id === optimism.id ? minSharesForSlippage : minOrNewShares!,
      chain.id === optimism.id ? minUnderlyingForSlippage : minOrNewUnderlying!,
    ],
    query: {
      enabled:
        minOrNewShares !== undefined &&
        minOrNewUnderlying !== undefined &&
        isApprovalNeededMint === false &&
        isApprovalNeededWithdraw === false,
    },
  });

  const { writeContract: writeMigratePrepared, data: migrateHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Migrate",
      }),
    });

  const { data: migrateReceipt } = useWaitForTransactionReceipt({
    hash: migrateHash,
  });

  useEffect(() => {
    if (migrateReceipt) {
      setAmount("");
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Alchemists] });
      queryClient.invalidateQueries({ queryKey: [QueryKeys.Vaults] });
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQueryPredicate({
            query,
            scopeKey: ScopeKeys.MigrateInput,
          }),
      });
    }
  }, [migrateReceipt, chain.id, queryClient, setAmount]);

  const writeWithdrawApprove = useCallback(() => {
    approveWithdrawConfig?.request &&
      writeWithdrawApprovePrepared(approveWithdrawConfig.request);
  }, [approveWithdrawConfig?.request, writeWithdrawApprovePrepared]);

  const writeMintApprove = useCallback(() => {
    approveMintConfig?.request &&
      writeMintApprovePrepared(approveMintConfig.request);
  }, [approveMintConfig?.request, writeMintApprovePrepared]);

  const writeMigrate = useCallback(() => {
    if (doesMigrationSucceed === false) {
      toast.error("Migration preparation failed", {
        description: reason,
      });
      return;
    }

    if (migrateConfigError) {
      toast.error("Migration failed", {
        description:
          migrateConfigError.name === "ContractFunctionExecutionError"
            ? migrateConfigError.cause.message
            : migrateConfigError.message,
      });
      return;
    }
    if (migrateConfig?.request) {
      writeMigratePrepared(migrateConfig.request);
    } else {
      toast.error("Migration failed", {
        description:
          "Migration failed. Unknown error. Please contact Alchemix team.",
      });
    }
  }, [
    doesMigrationSucceed,
    migrateConfig?.request,
    migrateConfigError,
    reason,
    writeMigratePrepared,
  ]);

  const isPending = (() => {
    if (!amount) return;
    if (isApprovalNeededWithdraw === false && isApprovalNeededMint === false) {
      return isPendingConfig;
    }
    return (
      isPendingApprovalMint ||
      isPendingApprovalWithdraw ||
      isFetchingApprovalMint ||
      isFetchingApprovalWithdraw
    );
  })();

  return {
    isApprovalNeededWithdraw,
    isApprovalNeededMint,
    writeWithdrawApprove,
    writeMintApprove,
    writeMigrate,
    isPending,
    minOrNewUnderlying,
    migrateConfigError,
  };
};
