import { curveGaugeAbi } from "@/abi/curveGauge";
import { stakingPoolsAbi } from "@/abi/stakingPools";
import { sushiMasterchefAbi } from "@/abi/sushiMasterchef";
import { Button } from "@/components/ui/button";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { CURVE, STAKING_POOL_ADDRESSES, SUSHI } from "@/lib/config/farms";
import { QueryKeys, ScopeKeys } from "@/lib/queries/queriesSchema";
import { Farm } from "@/lib/types";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";
import { invalidateWagmiUseQueryPredicate } from "@/utils/helpers/invalidateWagmiUseQueryPredicate";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { mainnet } from "viem/chains";
import {
  useAccount,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export const ExitButton = ({ farm }: { farm: Farm }) => {
  const chain = useChain();
  const queryClient = useQueryClient();
  const mutationCallback = useWriteContractMutationCallback();

  const { address } = useAccount();

  //-- Internal --//
  const { data: internalExitConfig, error: internalError } =
    useSimulateContract({
      address: STAKING_POOL_ADDRESSES[mainnet.id],
      abi: stakingPoolsAbi,
      chainId: chain.id,
      functionName: "exit",
      args: [BigInt(farm.poolId)],
      query: {
        enabled: farm.type === "internal",
      },
    });
  const {
    writeContract: exitInternal,
    data: internalExitHash,
    reset: resetExitInternal,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Exit",
    }),
  });
  const { data: internalExitReceipt } = useWaitForTransactionReceipt({
    hash: internalExitHash,
  });
  useEffect(() => {
    if (internalExitReceipt) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Farms("internal")],
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQueryPredicate({
            query,
            scopeKey: ScopeKeys.InternalFarmContent,
          }),
      });
      resetExitInternal();
    }
  }, [internalExitReceipt, queryClient, resetExitInternal]);

  //-- Sushi --//
  const { data: sushiExitConfig, error: sushiError } = useSimulateContract({
    address: SUSHI.masterchef,
    abi: sushiMasterchefAbi,
    chainId: chain.id,
    functionName: "emergencyWithdraw",
    args: [0n, address!],
    query: {
      enabled: !!address && farm.type === "external-sushi",
    },
  });
  const {
    writeContract: exitSushi,
    data: sushiExitHash,
    reset: resetExitSushi,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Exit",
    }),
  });
  const { data: sushiExitReceipt } = useWaitForTransactionReceipt({
    hash: sushiExitHash,
  });
  useEffect(() => {
    if (sushiExitReceipt) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Farms("sushi")],
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQueryPredicate({
            query,
            scopeKey: ScopeKeys.SushiFarmContent,
          }),
      });
      resetExitSushi();
    }
  }, [sushiExitReceipt, queryClient, resetExitSushi]);

  //-- Curve --//
  const { data: curveExitConfig, error: curveError } = useSimulateContract({
    address: CURVE.gauge,
    abi: curveGaugeAbi,
    chainId: chain.id,
    functionName: "withdraw",
    args: [parseEther(farm.staked.amount)],
    query: {
      enabled: farm.type === "external-curve" && +farm.staked.amount > 0,
    },
  });
  const {
    writeContract: exitCurve,
    data: curveExitHash,
    reset: resetExitCurve,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Exit",
    }),
  });
  const { data: curveExitReceipt } = useWaitForTransactionReceipt({
    hash: curveExitHash,
  });
  useEffect(() => {
    if (curveExitReceipt) {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Farms("curve")],
      });
      queryClient.invalidateQueries({
        predicate: (query) =>
          invalidateWagmiUseQueryPredicate({
            query,
            scopeKey: ScopeKeys.CurveFarmContent,
          }),
      });
      resetExitCurve();
    }
  }, [curveExitReceipt, queryClient, resetExitCurve]);

  const onExitFarm = useCallback(() => {
    if (farm.type === "internal") {
      if (internalError) {
        toast.error("Error exiting farm", {
          description: getToastErrorMessage({ error: internalError }),
        });
        return;
      }
      if (internalExitConfig) {
        exitInternal(internalExitConfig.request);
      } else {
        toast.error("Error exiting farm", {
          description:
            "Error exiting farm. Unexpected. Please, contact Alchemix team.",
        });
      }
      return;
    }

    if (farm.type === "external-sushi") {
      if (sushiError) {
        toast.error("Error exiting farm", {
          description: getToastErrorMessage({ error: sushiError }),
        });
        return;
      }
      if (sushiExitConfig) {
        exitSushi(sushiExitConfig.request);
      } else {
        toast.error("Error exiting farm", {
          description:
            "Error exiting farm. Unexpected. Please, contact Alchemix team.",
        });
      }
      return;
    }

    if (curveError) {
      toast.error("Error exiting farm", {
        description: getToastErrorMessage({ error: curveError }),
      });
      return;
    }
    if (curveExitConfig) {
      exitCurve(curveExitConfig.request);
    } else {
      toast.error("Error exiting farm", {
        description:
          "Error exiting farm. Unexpected. Please, contact Alchemix team.",
      });
    }
  }, [
    curveError,
    curveExitConfig,
    exitCurve,
    exitInternal,
    exitSushi,
    farm.type,
    internalError,
    internalExitConfig,
    sushiError,
    sushiExitConfig,
  ]);

  const isDisabled =
    +farm.staked.amount === 0 &&
    farm.rewards.reduce((acc, reward) => acc + +reward.amount, 0) === 0;

  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={isDisabled}
      onClick={onExitFarm}
    >
      Exit
    </Button>
  );
};
