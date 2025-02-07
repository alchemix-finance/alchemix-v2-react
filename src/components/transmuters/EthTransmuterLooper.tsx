import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useReadContracts,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther, zeroAddress } from "viem";
import { toast } from "sonner";
import { EyeOffIcon, EyeIcon } from "lucide-react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { fantom } from "viem/chains";

import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { TokenInput } from "../common/input/TokenInput";
import { formatNumber } from "@/utils/number";
import { useChain } from "@/hooks/useChain";
import { isInputZero } from "@/utils/inputNotZero";
import { useAllowance } from "@/hooks/useAllowance";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import {
  accordionVariants,
  accordionTransition,
  reducedMotionAccordionVariants,
} from "@/lib/motion/motion";
import { tokenizedStrategyAbi } from "@/abi/tokenizedStrategy";
import { SYNTH_ASSETS, SYNTH_ASSETS_ADDRESSES } from "@/lib/config/synths";
import { TransmuterMetadata } from "@/lib/config/metadataTypes";
import { ScopeKeys } from "@/lib/queries/queriesSchema";
import { useWatchQuery } from "@/hooks/useWatchQuery";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { GAS_ADDRESS, WETH_ADDRESSES } from "@/lib/constants";
import { SlippageInput } from "../common/input/SlippageInput";
import {
  usePortalApprove,
  usePortalAllowance,
  usePortalQuote,
  useSendPortalTransaction,
} from "@/hooks/usePortal";
import { CtaButton } from "../common/CtaButton";

export const EthTransmuterLooper = ({
  transmuterLooper,
}: {
  transmuterLooper: TransmuterMetadata;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();

  const isReducedMotion = useReducedMotion();

  const { address = zeroAddress } = useAccount();

  const [open, setOpen] = useState(false); // used to toggle the animation pane closed/open
  const [amount, setAmount] = useState(""); // represents amount of assets or shares depending on deposit or withdraw state
  const [isWithdraw, setIsWithdraw] = useState(false); // sets state of token input to accept input in assets or input in shares
  const [isInfiniteApproval, setIsInfiniteApproval] = useState(false);
  const [selectTokenAddress, setSelectTokenAddress] =
    useState<`0x${string}`>(GAS_ADDRESS);
  const [slippage, setSlippage] = useState("0.5"); // sets the slippage param used for depositing from or withdrawing into ETH, which requires a trade

  const { data: tokens } = useTokensQuery();
  const gasToken = tokens?.find((token) => token.address === GAS_ADDRESS);
  const wethToken =
    chain.id !== fantom.id
      ? tokens?.find((token) => token.address === WETH_ADDRESSES[chain.id])
      : undefined;
  const alEthToken = useMemo(() => {
    return chain.id !== fantom.id
      ? tokens?.find(
          (token) =>
            token.address ===
            SYNTH_ASSETS_ADDRESSES[chain.id][SYNTH_ASSETS.ALETH],
        )
      : undefined;
  }, [tokens, chain]);
  const selection =
    gasToken && wethToken && alEthToken
      ? [gasToken, wethToken, alEthToken]
      : [];
  const selectedToken = selection.find(
    (token) => token.address === selectTokenAddress,
  )!;

  useEffect(() => {
    setSelectTokenAddress(alEthToken?.address ?? GAS_ADDRESS);
  }, [alEthToken]);

  // ** INITIAL CONTRACT READS ** //
  // Read these contract functions once when the component renders for the first time. Return refetch functions for
  // anything that may need a value updated, and store those initial vals in dynamic state vars
  const { data: transmuterLooperContractStaticState } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        // Get the decimals used for the strategy and `asset`.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "decimals",
        chainId: chain.id,
      },
      {
        // Get the max the owner can deposit in asset.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "maxDeposit",
        chainId: chain.id,
        args: [address],
      },
    ],
  });
  const [decimals, maxDeposit] = transmuterLooperContractStaticState ?? [];

  /** EVENT TRIGGERED CONTRACT READS **/
  // Read these contract functions initially, but separately as they will be watched and reread per block in case they are updated
  const { data: transmuterLooperContractDynamicState } = useReadContracts({
    scopeKey: ScopeKeys.TransmuterLooperReported,
    allowFailure: false,
    contracts: [
      {
        // Gets the total assets deposited
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "totalAssets",
        chainId: chain.id,
      },
      {
        // Gets the total shares outstanding
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "totalSupply",
        chainId: chain.id,
      },
    ],
  });
  const [totalAssets, totalSupply] = transmuterLooperContractDynamicState ?? [];

  // Watch intermittently updated read values in case they are updated due to the report function or other manual updates to the contract
  useWatchQuery({
    scopeKey: ScopeKeys.TransmuterLooperReported,
  });

  /** PORTAL APPROVAL */
  const {
    data: portalAllowance,
    isPending: isPortalAllowancePending,
    isFetching: isPortalAllowanceFetching,
  } = usePortalAllowance({
    inputAmount: amount,
    inputToken: isWithdraw ? transmuterLooper.address : selectTokenAddress,
    // TODO: update when contracts are deployed
    inputTokenDecimals: isWithdraw ? 6 : 18,
  });
  const {
    isPortalApprovalNeeded,
    canPermit: isEligibleForGaslessSignature,
    approveTx: approvePortalTx,
    permit: approvePortalSignature,
  } = portalAllowance ?? {};

  /**
   * Get allowance info for alETH
   */
  const {
    isApprovalNeeded: isAlEthApprovalNeeded,
    approveConfig: alEthApproveConfig,
    approve: approveAlEth,
    isPending: isAllowanceAlEthPending,
    isFetching: isAllowanceAlEthFetching,
  } = useAllowance({
    tokenAddress: alEthToken?.address,
    spender: transmuterLooper.address,
    amount,
    decimals,
    isInfiniteApproval,
  });

  const {
    mutate: approvePortal,
    signature: portalGaslessSignature,
    resetGaslessSignature: resetPortalApprovalSignature,
    isPending: isPortalApprovalPending,
  } = usePortalApprove({
    isPortalApprovalNeeded,
    canPermit: isEligibleForGaslessSignature,
    approveTx: approvePortalTx,
    permit: approvePortalSignature,
  });

  const {
    data: portalQuote,
    error: portalQuoteError,
    isPending: isPendingPortalQuote,
  } = usePortalQuote({
    portalGaslessSignature: isWithdraw ? undefined : portalGaslessSignature,
    inputToken: isWithdraw
      ? transmuterLooper.address
      : selectTokenAddress === GAS_ADDRESS
        ? zeroAddress
        : selectTokenAddress,
    // TODO: update when contracts are deployed
    inputTokenDecimals: isWithdraw ? 6 : 18,
    inputAmount: amount,
    outputToken: isWithdraw
      ? selectTokenAddress === GAS_ADDRESS
        ? zeroAddress
        : selectTokenAddress
      : transmuterLooper.address,
    slippage,
    shouldQuote:
      !isInputZero(amount) &&
      selectTokenAddress !== alEthToken?.address &&
      (isPortalApprovalNeeded === false ||
        !!portalGaslessSignature ||
        (!isWithdraw && selectTokenAddress === GAS_ADDRESS)),
  });

  /**
   * Configure write contract functions for alETH deposit
   */
  const {
    data: depositConfig,
    error: depositError,
    isPending: isDepositConfigPending,
  } = useSimulateContract({
    address: transmuterLooper.address,
    abi: tokenizedStrategyAbi,
    chainId: chain.id,
    functionName: "deposit",
    args: [parseEther(amount), address],
    query: {
      enabled:
        !isInputZero(amount) &&
        isAlEthApprovalNeeded === false &&
        !isWithdraw &&
        selectTokenAddress === alEthToken?.address,
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
   * Configure write contract functions for alETH withdrawal
   */
  const {
    data: redeemConfig,
    error: redeemError,
    isPending: isRedeemConfigPending,
  } = useSimulateContract({
    address: transmuterLooper.address,
    abi: tokenizedStrategyAbi,
    chainId: chain.id,
    functionName: "redeem",
    args: [parseEther(amount), address, address],
    query: {
      enabled:
        !isInputZero(amount) &&
        isWithdraw === true &&
        selectTokenAddress === alEthToken?.address,
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

  /** PORTAL BUNDLER CALLS */
  const {
    mutate: sendPortalTransaction,
    isPending: isPortalTransactionPending,
  } = useSendPortalTransaction({
    quote: portalQuote,
    quoteError: portalQuoteError,
    onSuccess: () => {
      setAmount("");
      if (portalGaslessSignature) {
        resetPortalApprovalSignature();
      }
    },
  });

  const isAnyApprovalNeeded = (() => {
    if (selectTokenAddress === alEthToken?.address) {
      return isWithdraw ? false : isAlEthApprovalNeeded;
    }
    if (selectTokenAddress === GAS_ADDRESS && !isWithdraw) return false;
    return isPortalApprovalNeeded && !portalGaslessSignature;
  })();

  const onCtaClick = () => {
    if (isAnyApprovalNeeded) {
      if (selectTokenAddress === alEthToken?.address) {
        alEthApproveConfig && approveAlEth(alEthApproveConfig.request);
        return;
      }
      approvePortal();
    }

    if (selectTokenAddress !== alEthToken?.address) {
      sendPortalTransaction();
      return;
    }

    if (isWithdraw) {
      if (redeemError) {
        toast.error("Withdraw Error", {
          description:
            redeemError.name === "ContractFunctionExecutionError"
              ? redeemError.cause.message
              : redeemError.message,
        });
        return;
      }

      if (redeemConfig) {
        redeem(redeemConfig.request);
      } else {
        toast.error("Withdraw Error", {
          description: "Unexpected error. Please contact Alchemix team.",
        });
      }
      return;
    }

    if (depositError) {
      toast.error("Error depositing alETH", {
        description:
          depositError.name === "ContractFunctionExecutionError"
            ? depositError.cause.message
            : depositError.message,
      });
      return;
    }

    if (depositConfig) {
      deposit(depositConfig.request);
    } else {
      toast.error("Error depositing alETH", {
        description: "Unexpected error. Please contact Alchemix team.",
      });
    }
  };

  // Reuses contract logic of _convertToShares for a front end estimation so as not to trigger many RPC calls
  const previewDeposit = () => {
    if (totalAssets === undefined || totalSupply === undefined) {
      return "0";
    }

    const assetsToDeposit = parseEther(amount);

    // If assets are 0 but supply is not PPS = 0.
    if (totalAssets === 0n) {
      return totalSupply === 0n ? formatEther(assetsToDeposit) : "0";
    }

    // Perform multiplication and division:
    // assets.mulDiv(totalSupply_, totalAssets_, _rounding);
    // js truncation handles _rounding = down in the contract call.
    const expectedShares = (assetsToDeposit * totalSupply) / totalAssets;
    return formatEther(expectedShares);
  };

  // Reuses contract logic of _convertToAssets for a front end estimation so as not to trigger many RPC calls
  const previewRedeem = () => {
    if (totalAssets === undefined || totalSupply === undefined) {
      return "0";
    }

    const sharesToRedeem = parseEther(amount);

    if (totalSupply === 0n) {
      formatEther(sharesToRedeem);
    }

    // Perform multiplication and division:
    // shares.mulDiv(_totalAssets(S), supply, _rounding);
    // js truncation handles _rounding = down in the contract call.
    const expectedAssets = (sharesToRedeem * totalAssets) / totalSupply;
    return formatEther(expectedAssets);
  };

  // Calculates and sets previewedOutput for a deposit or withdraw for display purposes.
  // This represents the previewed output in shares or assets of a deposit or withdraw
  const previewedOutput = isWithdraw ? previewRedeem() : previewDeposit();

  const changeInputToDepositOrWithdraw = (value: boolean) => {
    setIsWithdraw(value);
    setAmount("");
  };

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const totalAssetsFormatted = formatEther(totalAssets ?? 0n);
  const totalSupplyFormatted = formatEther(totalSupply ?? 0n);
  const maxDepositFormatted = formatEther(maxDeposit ?? 0n);

  const isPreparing = (() => {
    if (!amount) return;

    if (selectTokenAddress === alEthToken?.address) {
      if (isWithdraw) {
        return isRedeemConfigPending;
      }
      if (isAlEthApprovalNeeded === false) {
        return isDepositConfigPending;
      } else return isAllowanceAlEthPending || isAllowanceAlEthFetching;
    }

    if (
      isPortalApprovalNeeded === false ||
      !!portalGaslessSignature ||
      (!isWithdraw && selectTokenAddress === GAS_ADDRESS)
    ) {
      return isPendingPortalQuote || isPortalTransactionPending;
    } else
      return (
        isPortalAllowanceFetching ||
        (isEligibleForGaslessSignature === false && isPortalApprovalPending) ||
        isPortalAllowancePending
      );
  })();

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
            variants={
              isReducedMotion
                ? reducedMotionAccordionVariants
                : accordionVariants
            }
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
                    <Select
                      value={selectTokenAddress}
                      onValueChange={(value) =>
                        setSelectTokenAddress(value as `0x${string}`)
                      }
                    >
                      <SelectTrigger className="h-auto w-24 sm:w-56">
                        <SelectValue placeholder="Token" asChild>
                          <div className="flex items-center gap-4">
                            <img
                              src={`/images/token-icons/${selectedToken?.symbol}.svg`}
                              alt={selectedToken?.symbol}
                              className="h-12 w-12"
                            />
                            <span className="hidden text-xl sm:inline">
                              {selectedToken?.symbol}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {selection.map((token) => (
                          <SelectItem key={token.address} value={token.address}>
                            {token.symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <TokenInput
                      amount={amount}
                      setAmount={(amount) => setAmount(amount)}
                      tokenAddress={
                        isWithdraw
                          ? transmuterLooper.address
                          : selectTokenAddress
                      }
                      tokenDecimals={
                        // TODO -- put this back when contract is deployed, and remove below condition which tests using a USDC vault with 6 decimals
                        /*
                      decimals ?? 18
                      */
                        isWithdraw ? 6 : 18
                      }
                      tokenSymbol={
                        isWithdraw ? "yvAlETH" : selectedToken?.symbol
                      }
                      dustToZero={isWithdraw}
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
                {selectTokenAddress !== alEthToken?.address && (
                  <SlippageInput
                    slippage={slippage}
                    setSlippage={setSlippage}
                  />
                )}
                {selectTokenAddress === alEthToken?.address && (
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
                )}
                <CtaButton
                  variant="outline"
                  width="full"
                  disabled={isInputZero(amount) || isPreparing}
                  onClick={onCtaClick}
                >
                  {isPreparing
                    ? "Preparing"
                    : isAnyApprovalNeeded
                      ? "Approve"
                      : isWithdraw
                        ? "Withdraw"
                        : "Deposit"}
                </CtaButton>
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
                <div className="flex w-full flex-col justify-between gap-6 rounded border-grey10inverse bg-grey10inverse p-4 sm:flex-row md:flex-row lg:flex-col xl:flex-row dark:border-grey10 dark:bg-grey10">
                  <div className="flex-1 flex-col">
                    <div className="mr-2 whitespace-nowrap text-sm text-bronze3">
                      yvAlETH Token Supply
                    </div>
                    <div className="flex">
                      <div className="mr-2 flex">
                        {formatNumber(totalSupplyFormatted)}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex-col">
                    <div className="mr-2 text-sm text-bronze3">
                      alETH Deposited To yvAlETH
                    </div>
                    <div className="flex">
                      <div className="mr-2 flex">
                        {formatNumber(totalAssetsFormatted)}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex-col">
                    <div className="mr-2 text-sm text-bronze3">
                      alETH Deposit Limit
                    </div>
                    <div className="flex">
                      <div className="mr-2 flex">
                        {formatNumber(maxDepositFormatted)}
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
