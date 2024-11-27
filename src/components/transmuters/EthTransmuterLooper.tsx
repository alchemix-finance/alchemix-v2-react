import { useEffect, useMemo, useState } from "react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import {
  useAccount,
  useReadContracts,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { TokenInput } from "../common/input/TokenInput";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { isInputZero } from "@/utils/inputNotZero";
import { useAllowance } from "@/hooks/useAllowance";
import { toast } from "sonner";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { EyeOffIcon, EyeIcon } from "lucide-react";
import { AnimatePresence, m } from "framer-motion";
import { accordionVariants, accordionTransition } from "@/lib/motion/motion";
import { tokenizedStrategyAbi } from "@/abi/tokenizedStrategy";
import { SYNTH_ASSETS, SYNTH_ASSETS_ADDRESSES } from "@/lib/config/synths";
import { mainnet } from "viem/chains";
import { TRANSMUTER_LOOPERS_VAULTS } from "@/lib/config/transmuters";
import {
  SupportedTransmuterLooperChainId,
  TransmuterMetadata,
} from "@/lib/config/metadataTypes";
import { ScopeKeys } from "@/lib/queries/queriesSchema";
import { useWatchQuery } from "@/hooks/useWatchQuery";

enum TL_STATIC_STATE_INDICIES {
  sharesTokenAddress = 0,
  decimals = 1,
  shareTokenName = 2,
  performanceFee = 3,
  maxDeposit = 4,
  maxMint = 5,
  maxRedeem = 6,
  maxWithdraw = 7,
  symbol = 8,
}

enum TL_DYNAMIC_STATE_INDICIES {
  fullProfitUnlockDate = 0,
  isShutdown = 1,
  lastReport = 2,
  balanceOf = 3,
  pricePerShare = 4,
  profitMaxUnlockTime = 5,
  profitUnlockingRate = 6,
  totalAssets = 7,
  totalSupply = 8,
}

export const EthTransmuterLooper = () => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();
  const { address } = useAccount();

  const [open, setOpen] = useState(false); // used to toggle the animation pane closed/open
  const [amount, setAmount] = useState(""); // represents amount of assets or shares depending on deposit or withdraw state
  const [isWithdraw, setIsWithdraw] = useState(false); // sets state of token input to accept input in assets or input in shares
  const [isInfiniteApproval, setIsInfiniteApproval] = useState(false);

  const { address: TRANSMUTER_LOOPER_ADDRESS } = useMemo(
    () =>
      TRANSMUTER_LOOPERS_VAULTS[
        chain.id as SupportedTransmuterLooperChainId
      ].find((vault) => vault.synthAsset === SYNTH_ASSETS.ALETH),
    [chain.id],
  ) as TransmuterMetadata;

  // ** INITIAL CONTRACT READS ** //
  // Read these contract functions once when the component renders for the first time. Return refetch functions for
  // anything that may need a value updated, and store those initial vals in dynamic state vars
  const { data: transmuterLooperContractStaticState } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        // Get the underlying asset for the strategy.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "asset",
        chainId: chain.id,
      },
      {
        // Get the decimals used for the strategy and `asset`.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "decimals",
        chainId: chain.id,
      },
      {
        // Get the name the strategy is using for it's token
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "name",
        chainId: chain.id,
      },
      {
        // Get the performance fee charged on profits.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "performanceFee",
        chainId: chain.id,
      },
      {
        // Get the max the owner can deposit in asset.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "maxDeposit",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Get the max the owner can mint in shares.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "maxMint",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Get the max amount of shares the owner can redeem
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "maxRedeem",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Get the max amount of assets the owner can withdraw
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "maxWithdraw",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Gets the symbol the strategy is using for its tokens as a string. (yvSymbol)
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "symbol",
        chainId: chain.id,
      },
    ],
    query: {
      select: ([
        sharesTokenAddress,
        decimals,
        shareTokenName,
        performanceFeeInBps,
        maxDeposit,
        maxMint,
        maxRedeem,
        maxWithdraw,
        symbol,
      ]) => {
        return [
          sharesTokenAddress,
          Number(decimals),
          shareTokenName,
          (performanceFeeInBps as number) / 100,
          BigInt(maxDeposit as number),
          BigInt(maxMint as number),
          BigInt(maxRedeem as number),
          BigInt(maxWithdraw as number),
          symbol,
        ];
      },
    },
  });

  /** EVENT TRIGGERED CONTRACT READS **/
  // Read these contract functions initially, but separately as they will be watched and reread per block in case they are updated
  const { data: transmuterLooperContractDynamicState } = useReadContracts({
    scopeKey: ScopeKeys.TransmuterLooperReported,
    allowFailure: false,
    contracts: [
      {
        // Get the timestamp at which all profits will unlock.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "fullProfitUnlockDate",
        chainId: chain.id,
      },
      {
        // Get status on whether the strategy is shut down.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "isShutdown",
        chainId: chain.id,
      },
      {
        // Get the timestamp of the last report
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "lastReport",
        chainId: chain.id,
      },
      {
        // Get the current balance in y shares of the address or account.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "balanceOf",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Get the price in asset per share
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "pricePerShare",
        chainId: chain.id,
      },
      {
        // Gets the current time profits are set to unlock over as uint.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "profitMaxUnlockTime",
        chainId: chain.id,
      },
      {
        // Gets the current time profits are set to unlock over as uint.
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "profitUnlockingRate",
        chainId: chain.id,
      },
      {
        // Gets the total assets deposited
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "totalAssets",
        chainId: chain.id,
      },
      {
        // Gets the total shares outstanding
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        functionName: "totalSupply",
        chainId: chain.id,
      },
    ],
    query: {
      select: ([
        fullProfitUnlockDate,
        isShutdown,
        lastReport,
        balanceOf,
        pricePerShare,
        profitMaxUnlockTime,
        profitUnlockingRate,
        totalAssets,
        totalSupply,
      ]) => {
        return [
          BigInt(fullProfitUnlockDate as number),
          isShutdown,
          BigInt(lastReport as number),
          BigInt(balanceOf as number),
          BigInt(pricePerShare as number),
          BigInt(profitMaxUnlockTime as number),
          BigInt(profitUnlockingRate as number),
          BigInt(totalAssets as number),
          BigInt(totalSupply as number),
        ];
      },
    },
  });

  // Watch intermittently updated read values in case they are updated due to the report function or other manual updates to the contract
  useWatchQuery({
    scopeKey: ScopeKeys.TransmuterLooperReported,
  });

  /** CONTRACT WRITES **/
  /**
   * Get allowance info for alETH
   */
  const {
    isApprovalNeeded,
    approveConfig: alETHApproveConfig,
    approve: approveSpendAlETH,
  } = useAllowance({
    tokenAddress: SYNTH_ASSETS_ADDRESSES[mainnet.id][SYNTH_ASSETS.ALETH],
    spender: TRANSMUTER_LOOPER_ADDRESS,
    amount,
    decimals:
      (transmuterLooperContractStaticState?.[
        TL_STATIC_STATE_INDICIES.decimals
      ] as number) || 18,
    isInfiniteApproval,
  });

  /**
   * Configure write contract functions for alETH deposit
   */
  const { data: depositConfig, error: depositError } = useSimulateContract({
    address: TRANSMUTER_LOOPER_ADDRESS,
    abi: tokenizedStrategyAbi,
    chainId: chain.id,
    functionName: "deposit",
    args: [parseEther(amount), address!],
    query: {
      enabled: !isInputZero(amount) && isApprovalNeeded === false,
    },
  });

  const { writeContract: deposit, data: depositHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Deposit",
    }),
  });

  const { data: depositReceipt } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  useEffect(() => {
    if (depositReceipt) {
      setAmount("");
    }
  }, [depositReceipt]);

  /**
   * Configure write contract functions for alETH withdrawl
   */
  const { data: redeemConfig, error: redeemError } = useSimulateContract({
    address: TRANSMUTER_LOOPER_ADDRESS,
    abi: tokenizedStrategyAbi,
    chainId: chain.id,
    functionName: "redeem",
    args: [parseEther(amount), address!, address!],
    query: {
      enabled: !isInputZero(amount),
    },
  });

  const { writeContract: redeem, data: redeemHash } = useWriteContract({
    mutation: mutationCallback({
      action: "Redeem",
    }),
  });

  const { data: redeemReceipt } = useWaitForTransactionReceipt({
    hash: redeemHash,
  });

  useEffect(() => {
    if (redeemReceipt) {
      setAmount("");
    }
  }, [redeemReceipt]);

  /** UI Actions **/
  const onDeposit = () => {
    // 1. Check approval
    if (isApprovalNeeded) {
      alETHApproveConfig && approveSpendAlETH(alETHApproveConfig.request);
      return;
    }

    // 2. Check for contract call error
    if (depositError) {
      toast.error("Error depositing alETH", {
        description:
          depositError.name === "ContractFunctionExecutionError"
            ? depositError.cause.message
            : depositError.message,
      });
      return;
    }

    // 3. Deposit
    if (depositConfig) {
      deposit(depositConfig.request);
    } else {
      toast.error("Error depositing alETH", {
        description: "Unexpected error. Please contact Alchemix team.",
      });
    }

    // TODO -- do I need to refetch the shares/assets balance here, or is it taken care of by the transaction occuring and a refetch in the next block?
  };

  const onWithdraw = () => {
    // 1. Check for contract call error
    if (redeemError) {
      toast.error("Error withdrawing alETH", {
        description:
          redeemError.name === "ContractFunctionExecutionError"
            ? redeemError.cause.message
            : redeemError.message,
      });
      return;
    }

    // 2. Withdraw
    if (redeemConfig) {
      redeem(redeemConfig.request);
    } else {
      toast.error("Error withdrawing alETH", {
        description: "Unexpected error. Please contact Alchemix team.",
      });
    }

    // TODO -- do I need to refetch the shares/assets balance here, or is it taken care of by the transaction occuring and a refetch in the next block?
  };

  // Reuses contract logic of _convertToShares for a front end estimation so as not to trigger many RPC calls
  const previewDeposit = () => {
    // Get inputted assetsToDeposit, totalAssets, and totalSupply
    const assetsToDeposit = parseEther(amount); // TODO -- need to validate this input otherwise an error will be thrown. Does token input do this?
    const totalAssets =
      (transmuterLooperContractDynamicState?.[
        TL_DYNAMIC_STATE_INDICIES.totalAssets
      ] as bigint) || BigInt(0);
    const totalSupply =
      (transmuterLooperContractDynamicState?.[
        TL_DYNAMIC_STATE_INDICIES.totalSupply
      ] as bigint) || BigInt(0);

    // If assets are 0 but supply is not PPS = 0.
    if (totalAssets === BigInt(0)) {
      return totalSupply === BigInt(0) ? formatEther(assetsToDeposit) : 0;
    }

    // Perform multiplication and division:
    // assets.mulDiv(totalSupply_, totalAssets_, _rounding);
    // js truncation handles _rounding = down in the contract call.
    const expectedShares = (assetsToDeposit * totalSupply) / totalAssets;
    return formatEther(expectedShares);
  };

  // Reuses contract logic of _convertToAssets for a front end estimation so as not to trigger many RPC calls
  const previewRedeem = () => {
    // Get inputted sharesToRedeem, totalAssets, and totalSupply
    const sharesToRedeem = parseEther(amount); // TODO -- need to validate this input otherwise an error will be thrown. Does token input do this?
    const totalAssets =
      (transmuterLooperContractDynamicState?.[
        TL_DYNAMIC_STATE_INDICIES.totalAssets
      ] as bigint) || BigInt(0);
    const totalSupply =
      (transmuterLooperContractDynamicState?.[
        TL_DYNAMIC_STATE_INDICIES.totalSupply
      ] as bigint) || BigInt(0);

    if (totalSupply == BigInt(0)) {
      return totalSupply == BigInt(0) ? formatEther(sharesToRedeem) : 0;
    }

    // Perform multiplication and division:
    // shares.mulDiv(_totalAssets(S), supply, _rounding);
    // js truncation handles _rounding = down in the contract call.
    const expectedAssets = (sharesToRedeem * totalAssets) / totalSupply;
    return formatEther(expectedAssets);
  };

  // Calculates and sets previewedOutput for a deposit or withdraw for display purposes.
  // This represents the previewed output in shares or assets of a deposit or withdraw
  const previewedOutput = isWithdraw
    ? (previewRedeem() as string)
    : (previewDeposit() as string);

  const changeInputToDepositOrWithdraw = (value: boolean) => {
    setIsWithdraw(value);
    setAmount("");
  };

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative w-full rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
      <div
        className="flex select-none items-center justify-between bg-grey10inverse px-6 py-4 text-sm hover:cursor-pointer dark:bg-grey10"
        onClick={handleOpen}
      >
        <p className="text-sm">Transmuter Looper</p>
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
            key="TransmuterLooper"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={accordionVariants}
            transition={accordionTransition}
          >
            <div className="flex flex-col gap-8 p-4 lg:flex-row">
              <div className="flex w-full flex-col space-y-4 rounded border border-grey10inverse bg-grey10inverse p-4 dark:border-grey10 dark:bg-grey10">
                <div className="flex flex-row justify-end">
                  <div className="flex items-center">
                    <label
                      className="pr-[15px] text-sm leading-none text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="is-deposit-or-withdraw"
                    >
                      Deposit
                    </label>
                    <Switch
                      checked={isWithdraw}
                      onCheckedChange={changeInputToDepositOrWithdraw}
                      id="is-deposit-or-withdraw"
                    />
                    <label
                      className="pl-[15px] text-sm leading-none text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="is-deposit-or-withdraw"
                    >
                      Withdraw
                    </label>
                  </div>
                </div>
                <div className="relative flex w-full flex-row">
                  <div className="flex w-full justify-end rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
                    <TokenInput
                      amount={amount}
                      setAmount={setAmount}
                      tokenAddress={
                        isWithdraw
                          ? TRANSMUTER_LOOPER_ADDRESS
                          : SYNTH_ASSETS_ADDRESSES[mainnet.id][
                              SYNTH_ASSETS.ALETH
                            ]
                      }
                      // TODO -- can probably remove overrideBalance when real contract address is ready
                      overrideBalance={
                        isWithdraw
                          ? `${
                              transmuterLooperContractDynamicState?.[
                                TL_DYNAMIC_STATE_INDICIES.balanceOf
                              ]
                            }` || "0"
                          : undefined
                      }
                      tokenDecimals={
                        (transmuterLooperContractStaticState?.[
                          TL_STATIC_STATE_INDICIES.decimals
                        ] as number) || 18
                      }
                      tokenSymbol={isWithdraw ? "yvAlETH" : "alETH"}
                    />
                  </div>
                </div>
                <div className="flex h-8 flex-row space-x-4">
                  <div className="flex w-full rounded bg-grey3inverse p-4 text-center text-xl dark:bg-grey3">
                    <p className="w-full self-center text-right text-sm text-lightgrey10">
                      {isWithdraw
                        ? `${formatNumber(previewedOutput)} alETH`
                        : `${formatNumber(previewedOutput)} yvAlETH`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row justify-between">
                  <p className="flex-auto text-sm text-lightgrey10inverse dark:text-lightgrey10">
                    Approval
                  </p>
                  <div className="flex items-center">
                    <label
                      className="pr-[15px] text-sm leading-none text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="is-infinite-approval"
                    >
                      Fixed
                    </label>
                    <Switch
                      checked={isInfiniteApproval}
                      onCheckedChange={setIsInfiniteApproval}
                      id="is-infinite-approval"
                    />
                    <label
                      className="pl-[15px] text-sm leading-none text-lightgrey10inverse dark:text-lightgrey10"
                      htmlFor="is-infinite-approval"
                    >
                      Infinite
                    </label>
                  </div>
                </div>
                <Button
                  variant="outline"
                  disabled={isInputZero(amount)}
                  onClick={isWithdraw ? onWithdraw : onDeposit}
                >
                  {isWithdraw ? "Withdraw" : "Deposit"}
                </Button>
              </div>
              <div className="flex flex-col justify-between gap-4">
                <div className="w-full rounded border-grey10inverse bg-grey10inverse p-4 dark:border-grey10 dark:bg-grey10">
                  <p className="mb-4">An alETH Transmuter Looping Vault.</p>
                  <p className="mb-2 text-sm">
                    Deposit your alETH into yvAlETH to have your alETH
                    perpetually staked in the transmuter, with profits in ETH
                    recycled into alETH at a discount, for a perpetual yield on
                    alETH over time.
                  </p>
                </div>
                <div className="flex w-full flex-col justify-between gap-6 rounded border-grey10inverse bg-grey10inverse p-4 lg:flex-row dark:border-grey10 dark:bg-grey10">
                  <div className="flex-col">
                    <div className="mr-2 whitespace-nowrap text-sm text-bronze3">
                      yvAlETH Token Supply
                    </div>
                    <div className="flex">
                      <div className="mr-2 flex">
                        {formatNumber(
                          `${(transmuterLooperContractDynamicState?.[TL_DYNAMIC_STATE_INDICIES.totalSupply] as bigint) || BigInt(0)}`,
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-col">
                    <div className="mr-2 whitespace-nowrap text-sm text-bronze3">
                      alETH Deposited To yvAlETH
                    </div>
                    <div className="flex">
                      <div className="mr-2 flex">
                        {formatNumber(
                          `${(transmuterLooperContractDynamicState?.[TL_DYNAMIC_STATE_INDICIES.totalAssets] as bigint) || BigInt(0)}`,
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-col">
                    <div className="mr-2 whitespace-nowrap text-sm text-bronze3">
                      alETH Deposit Limit
                    </div>
                    <div className="flex">
                      <div className="mr-2 flex">
                        {formatNumber(
                          `${(transmuterLooperContractStaticState?.[TL_STATIC_STATE_INDICIES.maxDeposit] as bigint) || BigInt(0)}`,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
