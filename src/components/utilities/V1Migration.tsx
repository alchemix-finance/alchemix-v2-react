import { useState, useEffect } from "react";
import { EyeOffIcon, EyeIcon } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import {
  useAccount,
  useReadContracts,
  useSimulateContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, zeroAddress } from "viem";
import { toast } from "sonner";

import { v1MigratorAbi } from "@/abi/v1Migrator";
import { v1AlchemistAbi } from "@/abi/v1Alchemist";
import { SYNTH_ASSETS, SynthAsset } from "@/lib/config/synths";
import { V1_ALCHEMISTS, V1_MIGRATORS } from "@/lib/config/v1Migrators";
import {
  accordionVariants,
  accordionTransition,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";
import { Button } from "@/components/ui/button";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { useChain } from "@/hooks/useChain";
import { formatNumber } from "@/utils/number";
import { getToastErrorMessage } from "@/utils/helpers/getToastErrorMessage";

export const V1Migration = () => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const [open, setOpen] = useState(false);
  const isReducedMotion = useReducedMotion();

  const { address } = useAccount();

  const { data: migrationData, refetch: refetchMigrationData } =
    useReadContracts({
      allowFailure: false,
      contracts: [
        {
          address: V1_MIGRATORS[SYNTH_ASSETS.ALETH],
          abi: v1MigratorAbi,
          chainId: chain.id,
          functionName: "hasMigrated",
          args: [address ?? zeroAddress],
        },
        {
          address: V1_MIGRATORS[SYNTH_ASSETS.ALUSD],
          abi: v1MigratorAbi,
          chainId: chain.id,
          functionName: "hasMigrated",
          args: [address ?? zeroAddress],
        },
        {
          address: V1_ALCHEMISTS[SYNTH_ASSETS.ALETH],
          abi: v1AlchemistAbi,
          chainId: chain.id,
          functionName: "getCdpTotalDeposited",
          args: [address ?? zeroAddress],
        },
        {
          address: V1_ALCHEMISTS[SYNTH_ASSETS.ALUSD],
          abi: v1AlchemistAbi,
          chainId: chain.id,
          functionName: "getCdpTotalDeposited",
          args: [address ?? zeroAddress],
        },
      ] as const,
      query: {
        enabled: !!address,
      },
    });
  const [hasMigratedAlETH, hasMigratedAlUSD, alEthAmount, alUsdAmount] =
    migrationData ?? [];

  const { data: migrationAlUsdConfig, error: migrationAlUsdError } =
    useSimulateContract({
      address: V1_ALCHEMISTS[SYNTH_ASSETS.ALUSD],
      abi: v1AlchemistAbi,
      functionName: "withdraw",
      args: [1n],
      query: {
        enabled:
          !!address &&
          hasMigratedAlUSD === false &&
          alUsdAmount !== undefined &&
          alUsdAmount > 0,
      },
    });

  const { data: migrationAlEthConfig, error: migrationAlEthError } =
    useSimulateContract({
      address: V1_ALCHEMISTS[SYNTH_ASSETS.ALETH],
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "_amount",
              type: "uint256",
            },
            {
              internalType: "bool",
              name: "asEth",
              type: "bool",
            },
          ],
          name: "withdraw",
          outputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "withdraw",
      args: [1n, false],
      query: {
        enabled:
          !!address &&
          hasMigratedAlETH === false &&
          alEthAmount !== undefined &&
          alEthAmount > 0,
      },
    });

  const {
    writeContract: migrate,
    reset: resetMigrate,
    data: migrateTxHash,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Migrate alETH",
    }),
  });

  const { data: migrateReceipt } = useWaitForTransactionReceipt({
    hash: migrateTxHash,
  });

  useEffect(() => {
    if (migrateReceipt?.status === "success") {
      refetchMigrationData();
      resetMigrate();
    }
  }, [migrateReceipt?.status, refetchMigrationData, resetMigrate]);

  const onMigrate = (synth: SynthAsset) => {
    if (synth === SYNTH_ASSETS.ALUSD) {
      if (migrationAlUsdError) {
        toast.error("Error migrating liquidity", {
          description: getToastErrorMessage({ error: migrationAlUsdError }),
        });
        return;
      }

      if (migrationAlUsdConfig) {
        migrate(migrationAlUsdConfig.request);
      } else {
        toast.error("Error migrating liquidity", {
          description:
            "Unexpected migration error. Please contact Alchemix team.",
        });
      }
    } else {
      if (migrationAlEthError) {
        toast.error("Error migrating liquidity", {
          description: getToastErrorMessage({ error: migrationAlEthError }),
        });
        return;
      }

      if (migrationAlEthConfig) {
        migrate(migrationAlEthConfig.request);
      } else {
        toast.error("Error migrating liquidity", {
          description:
            "Unexpected migration error. Please contact Alchemix team.",
        });
      }
    }
  };

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const disabledAlUsdMigration = !!hasMigratedAlUSD || !alUsdAmount;
  const disabledAlEthMigration = !!hasMigratedAlETH || !alEthAmount;

  return (
    <div className="relative w-full rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
      <div
        className="flex select-none items-center justify-between bg-grey10inverse px-6 py-4 text-sm hover:cursor-pointer dark:bg-grey10"
        onClick={handleOpen}
      >
        <p className="text-sm">Legacy Migration</p>
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
            key="legacyMigration"
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
              <div className="space-y-4">
                <p>
                  To make it as simple as possible to migrate your Legacy vault
                  deposits into V2, Alchemix is providing a migration tool which
                  enables you to transfer your position into V2 while staying as
                  gas-cost efficient as possible.
                </p>
                <p>
                  {`The migration is done with a single call to the legacy (v1)
                  Alchemist's "withdraw" function.`}
                </p>
              </div>
              <div className="flex items-center gap-4 rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
                <div className="flex w-full flex-col gap-4 rounded p-4">
                  <p className="text-lightgrey10inverse dark:text-lightgrey10">
                    Alchemist: alUSD
                  </p>
                  <p>
                    Your Balance: {formatNumber(formatEther(alUsdAmount ?? 0n))}{" "}
                    DAI
                  </p>
                  <p className="text-sm text-lightgrey10inverse dark:text-lightgrey10">
                    This will migrate your legacy DAI/alUSD position from the
                    contract 0xc21D353FF4ee73C572425697f4F5aaD2109fe35b.
                  </p>
                  <Button
                    onClick={() => onMigrate(SYNTH_ASSETS.ALUSD)}
                    disabled={disabledAlUsdMigration}
                  >
                    {hasMigratedAlUSD
                      ? "Legacy position migrated"
                      : "Migrate legacy position"}
                  </Button>
                </div>
                <div className="flex w-full flex-col gap-4 rounded p-4">
                  <p className="text-lightgrey10inverse dark:text-lightgrey10">
                    Alchemist: alETH
                  </p>
                  <p>
                    Your Balance: {formatNumber(formatEther(alEthAmount ?? 0n))}{" "}
                    ETH
                  </p>
                  <p className="text-sm text-lightgrey10inverse dark:text-lightgrey10">
                    This will migrate your legacy ETH/alETH position from the
                    contract 0xf8317BD5F48B6fE608a52B48C856D3367540B73B.
                  </p>
                  <Button
                    onClick={() => onMigrate(SYNTH_ASSETS.ALETH)}
                    disabled={disabledAlEthMigration}
                  >
                    {hasMigratedAlETH
                      ? "Legacy position migrated"
                      : "Migrate legacy position"}
                  </Button>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
