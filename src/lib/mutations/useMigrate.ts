import { Vault } from "@/lib/types";
import { MIGRATORS } from "../config/migrators";
import { useChain } from "@/hooks/useChain";
import { arbitrum, fantom } from "viem/chains";
import {
  useAccount,
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { vaultMigrationToolAbi } from "@/abi/vaultMigrationTool";
import { parseUnits } from "viem";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { SYNTH_ASSETS } from "../config/synths";
import { QueryKeys, ScopeKeys } from "../queries/queriesSchema";
import { isInputZero } from "@/utils/inputNotZero";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { invalidateWagmiUseQuery } from "@/utils/helpers/invalidateWagmiUseQuery";

export const useMigrate = ({
  currentVault,
  selectedVault,
  amount,
  setAmount,
}: {
  amount: string;
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
  const [doesMigrationSucceed, reason, , minShares, minUnderlying] =
    migrationParams ?? [];

  const {
    data: isApprovalNeededWithdraw,
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

  const { data: isApprovalNeededMint, queryKey: isApprovalNeededMintQueryKey } =
    useReadContract({
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
    approveWithdrawReceipt,
    isApprovalNeededWithdrawQueryKey,
    queryClient,
    resetApproveWithdraw,
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
    approveMintReceipt,
    isApprovalNeededMintQueryKey,
    queryClient,
    resetApproveMint,
  ]);

  const {
    data: migrateConfig,
    isFetching,
    error: migrateConfigError,
  } = useSimulateContract({
    address: migratorToolAddress,
    abi: vaultMigrationToolAbi,
    functionName: "migrateVaults",
    args: [
      currentVault.address,
      selectedVault.address,
      parseUnits(amount, currentVault.yieldTokenParams.decimals),
      minShares!,
      minUnderlying!,
    ],
    query: {
      enabled:
        minShares !== undefined &&
        minUnderlying !== undefined &&
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
          invalidateWagmiUseQuery({
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

  return {
    isApprovalNeededWithdraw,
    isApprovalNeededMint,
    writeWithdrawApprove,
    writeMintApprove,
    writeMigrate,
    isFetching,
  };
};
