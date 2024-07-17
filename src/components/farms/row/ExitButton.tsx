//     if (farmType === FarmTypes.INTERNAL) {
//       const castedFarm = castToInternalFarmType(farm);

import { curveGaugeAbi } from "@/abi/curveGauge";
import { stakingPoolsAbi } from "@/abi/stakingPools";
import { sushiMasterchefAbi } from "@/abi/sushiMasterchef";
import { wagmiConfig } from "@/components/providers/Web3Provider";
import { Button } from "@/components/ui/button";
import { useChain } from "@/hooks/useChain";
import { curve, stakingPoolsAddresses, sushi } from "@/lib/config/farms";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { Farm } from "@/lib/types";
import { mutationCallback } from "@/utils/helpers/mutationCallback";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { parseEther } from "viem";
import { mainnet } from "viem/chains";
import {
  useAccount,
  usePublicClient,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";

export const ExitButton = ({ farm }: { farm: Farm }) => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const queryClient = useQueryClient();
  const addRecentTransaction = useAddRecentTransaction();

  const { address } = useAccount();

  //-- Internal --//
  const { data: internalExitConfig, error: internalError } =
    useSimulateContract({
      address: stakingPoolsAddresses[mainnet.id],
      abi: stakingPoolsAbi,
      functionName: "exit",
      args: [BigInt(farm.poolId)],
      query: {
        enabled: farm.type === "internal",
      },
    });
  const { writeContract: exitInternal, data: internalExitHash } =
    useWriteContract({
      mutation: mutationCallback({
        action: "Exit",
        addRecentTransaction,
        publicClient,
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
    }
  }, [internalExitReceipt, queryClient]);

  //-- Sushi --//
  const { data: sushiExitConfig, error: sushiError } = useSimulateContract({
    address: sushi.masterchef,
    abi: sushiMasterchefAbi,
    functionName: "emergencyWithdraw",
    args: [0n, address!],
    query: {
      enabled: !!address && farm.type === "external-sushi",
    },
  });
  const { writeContract: exitSushi, data: sushiExitHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Exit",
      addRecentTransaction,
      publicClient,
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
    }
  }, [sushiExitReceipt, queryClient]);

  //-- Curve --//
  const { data: curveExitConfig, error: curveError } = useSimulateContract({
    address: curve.gauge,
    abi: curveGaugeAbi,
    functionName: "withdraw",
    args: [parseEther(farm.staked.amount)],
    query: {
      enabled: farm.type === "external-curve" && +farm.staked.amount > 0,
    },
  });
  const { writeContract: exitCurve, data: curveExitHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Exit",
      addRecentTransaction,
      publicClient,
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
    }
  }, [curveExitReceipt, queryClient]);

  const onExitFarm = useCallback(() => {
    if (farm.type === "internal") {
      if (internalError) {
        toast.error("Error exiting farm", {
          description:
            internalError.name === "ContractFunctionExecutionError"
              ? internalError.cause.message
              : internalError.message,
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
          description:
            sushiError.name === "ContractFunctionExecutionError"
              ? sushiError.cause.message
              : sushiError.message,
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
        description:
          curveError.name === "ContractFunctionExecutionError"
            ? curveError.cause.message
            : curveError.message,
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
      variant="outline"
      className="red5 hover:red-3 border-red4"
      disabled={isDisabled}
      onClick={onExitFarm}
    >
      Exit
    </Button>
  );
};
