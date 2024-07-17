import { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import {
  AURA_LP,
  BALANCER_LP,
  MIGRATION_CALCS_ADDRESS,
  SUSHI_LP,
  WETH_PRICE_FEED,
  TOKEN_PRICE_FEED,
  LP_MIGRATION_SLIPPAGE,
  MIGRATOR_ADDRESS,
} from "@/lib/config/liquidityMigration";
import { migrationCalcsAbi } from "@/abi/migrationCalcs";
import { formatEther, parseEther } from "viem";
import { isInputZero } from "@/utils/inputNotZero";
import { Button } from "../ui/button";
import { LoadingBar } from "../common/LoadingBar";
import { migratorAbi } from "@/abi/migrator";
import { useAllowance } from "@/hooks/useAllowance";
import { toast } from "sonner";
import { TokenInput } from "../common/input/TokenInput";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { useChain } from "@/hooks/useChain";

const TOKENS_FROM = ["SLP"] as const;
const TOKENS_TO = ["AURA", "BALANCER"] as const;

type From = (typeof TOKENS_FROM)[number];
type Target = (typeof TOKENS_TO)[number];

export const LiquidityMigration = () => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const [migrationAmount, setMigrationAmount] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<From>(TOKENS_FROM[0]);
  const [selectedTarget, setSelectedTarget] = useState<Target>(TOKENS_TO[0]);

  const { data: migrationParams, isFetching: isFetchingMigrationParams } =
    useReadContract({
      address: MIGRATION_CALCS_ADDRESS,
      abi: migrationCalcsAbi,
      chainId: chain.id,
      functionName: "getMigrationParams",
      args: [
        {
          stakeBpt: selectedTarget === "AURA",
          amount: parseEther(migrationAmount),
          slippage: LP_MIGRATION_SLIPPAGE,
          wethPriceFeed: WETH_PRICE_FEED,
          tokenPriceFeed: TOKEN_PRICE_FEED,
          auraPool: AURA_LP,
          balancerPoolToken: BALANCER_LP,
          poolToken: SUSHI_LP,
        },
      ],
      query: {
        enabled: !isInputZero(migrationAmount),
      },
    });

  const projectedAmount =
    selectedTarget === "AURA"
      ? migrationParams?.amountAuraSharesMinimum
      : migrationParams?.amountBalancerLiquidityOut;

  const { isApprovalNeeded, approveConfig, approve } = useAllowance({
    amount: migrationAmount,
    spender: MIGRATOR_ADDRESS,
    tokenAddress: SUSHI_LP,
    decimals: 18,
  });

  const { data: migrationConfig, error: migrationError } = useSimulateContract({
    address: MIGRATOR_ADDRESS,
    abi: migratorAbi,
    functionName: "migrate",
    args: [migrationParams!],
    query: {
      enabled: migrationParams !== undefined && isApprovalNeeded === false,
    },
  });
  const { writeContract: migrate, data: migrationHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Migrate",
    }),
  });
  const { data: migrationReceipt } = useWaitForTransactionReceipt({
    hash: migrationHash,
  });
  useEffect(() => {
    if (migrationReceipt) {
      setMigrationAmount("");
    }
  }, [migrationReceipt]);

  const onMigrate = useCallback(() => {
    if (isApprovalNeeded) {
      approveConfig && approve(approveConfig.request);
      return;
    }

    if (migrationError) {
      toast.error("Error migrating liquidity", {
        description:
          migrationError.name === "ContractFunctionExecutionError"
            ? migrationError.cause.message
            : migrationError.message,
      });
      return;
    }

    if (migrationConfig) {
      migrate(migrationConfig.request);
    } else {
      toast.error("Error migrating liquidity", {
        description:
          "Unexpected migration error. Please contact Alchemix team.",
      });
    }
  }, [
    approve,
    approveConfig,
    isApprovalNeeded,
    migrate,
    migrationConfig,
    migrationError,
  ]);

  return (
    <div className="relative w-full rounded border border-grey10inverse bg-grey15inverse">
      <div className="w-full bg-grey10inverse">
        <p className="text-sm">Liquidity Migration</p>
      </div>
      <div className="flex flex-col gap-8 p-4">
        <div className="flex items-center">
          <p>From:</p>{" "}
          <Select
            value={selectedFrom}
            onValueChange={(value) => setSelectedFrom(value as From)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select from">
                {selectedFrom}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TOKENS_FROM.map((token) => (
                <SelectItem key={token} value={token}>
                  {token}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center">
          <p>To:</p>{" "}
          <Select
            value={selectedTarget}
            onValueChange={(value) => setSelectedTarget(value as Target)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select to">
                {selectedTarget}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TOKENS_TO.map((token) => (
                <SelectItem key={token} value={token}>
                  {token}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <TokenInput
          amount={migrationAmount}
          setAmount={setMigrationAmount}
          tokenDecimals={18}
          tokenAddress={SUSHI_LP}
          tokenSymbol="Sushi LP"
        />
        <Input
          readOnly
          aria-readonly
          type="number"
          value={
            projectedAmount === undefined ? "" : formatEther(projectedAmount)
          }
          placeholder={`0.00 ${selectedTarget}`}
        />
        {isFetchingMigrationParams ? (
          <div className="flex h-12 flex-row items-center justify-center">
            <LoadingBar />
          </div>
        ) : (
          <Button disabled={isInputZero(migrationAmount)} onClick={onMigrate}>
            {isApprovalNeeded ? "Approve" : "Migrate Liquidity"}
          </Button>
        )}
      </div>
    </div>
  );
};
