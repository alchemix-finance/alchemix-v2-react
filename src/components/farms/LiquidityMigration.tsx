import { useCallback, useEffect, useState } from "react";
import {
  useReadContract,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { EyeOffIcon, EyeIcon } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { toast } from "sonner";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
import { isInputZero } from "@/utils/inputNotZero";
import { Button } from "../ui/button";
import { LoadingBar } from "../common/LoadingBar";
import { migratorAbi } from "@/abi/migrator";
import { useAllowance } from "@/hooks/useAllowance";
import { TokenInput } from "../common/input/TokenInput";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { useChain } from "@/hooks/useChain";
import {
  accordionVariants,
  accordionTransition,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";

const TOKENS_FROM = ["SLP"] as const;
const TOKENS_TO = ["AURA", "BALANCER"] as const;

type From = (typeof TOKENS_FROM)[number];
type Target = (typeof TOKENS_TO)[number];

export const LiquidityMigration = () => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const [open, setOpen] = useState(false);
  const [migrationAmount, setMigrationAmount] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<From>(TOKENS_FROM[0]);
  const [selectedTarget, setSelectedTarget] = useState<Target>(TOKENS_TO[0]);
  const isReducedMotion = useReducedMotion();

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

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative w-full rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
      <div
        className="flex select-none items-center justify-between bg-grey10inverse px-6 py-4 text-sm hover:cursor-pointer dark:bg-grey10"
        onClick={handleOpen}
      >
        <p className="text-sm">Sushi to Balancer Liquidity Migration</p>
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
            key="liquidityMigration"
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
            <div className="flex flex-col gap-8 p-4">
              <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
                <Select
                  value={selectedFrom}
                  onValueChange={(value) => setSelectedFrom(value as From)}
                >
                  <SelectTrigger className="h-auto w-24 sm:w-56">
                    <SelectValue placeholder="Select From" asChild>
                      <div className="flex items-center gap-4">
                        <img
                          src={`/images/token-icons/${selectedFrom}.svg`}
                          alt={selectedFrom}
                          className="hidden h-12 w-12 sm:block"
                        />
                        <span className="text-xl">{selectedFrom}</span>
                      </div>
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
                <TokenInput
                  amount={migrationAmount}
                  setAmount={setMigrationAmount}
                  tokenDecimals={18}
                  tokenAddress={SUSHI_LP}
                  tokenSymbol="Sushi LP"
                />
              </div>
              <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
                <Select
                  value={selectedTarget}
                  onValueChange={(value) => setSelectedTarget(value as Target)}
                >
                  <SelectTrigger className="h-auto w-24 sm:w-56">
                    <SelectValue placeholder="Select To" asChild>
                      <div className="flex items-center gap-4">
                        <img
                          src={`/images/token-icons/${selectedTarget}.svg`}
                          alt={selectedTarget}
                          className="hidden h-12 w-12 sm:block"
                        />
                        <span className="text-xl">{selectedTarget}</span>
                      </div>
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
                <div className="h-20 flex-grow">
                  <Input
                    readOnly
                    aria-readonly
                    type="text"
                    value={
                      projectedAmount === undefined
                        ? ""
                        : formatEther(projectedAmount)
                    }
                    placeholder={`0.00 ${selectedTarget}`}
                    className="h-full text-right"
                  />
                </div>
              </div>
              {isFetchingMigrationParams ? (
                <div className="flex h-12 flex-row items-center justify-center">
                  <LoadingBar />
                </div>
              ) : (
                <Button
                  disabled={isInputZero(migrationAmount)}
                  onClick={onMigrate}
                >
                  {isApprovalNeeded ? "Approve" : "Migrate Liquidity"}
                </Button>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
