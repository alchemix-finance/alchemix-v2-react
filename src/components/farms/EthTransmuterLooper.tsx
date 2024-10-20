import {useEffect, useMemo, useReducer, useState} from "react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import {
    useAccount, useReadContract,
    useReadContracts,
    useSimulateContract,
    useWaitForTransactionReceipt, useWatchContractEvent,
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
import {tokenizedStrategyAbi} from "@/abi/transmuter-looping-vaults/tokenizedStrategy";
import {SYNTH_ASSETS, SYNTH_ASSETS_ADDRESSES} from "@/lib/config/synths";
import {mainnet} from "viem/chains";
import {BigNumber} from "@ethersproject/bignumber";
import {TRANSMUTER_LOOPERS_VAULTS} from "@/lib/config/transmuters";

enum TL_DYNAMIC_STATE_VARS {
    FULL_PROFIT_UNLOCK_DATE = "fullProfitUnlockDate",
    IS_SHUTDOWN = "isShutdown",
    LAST_REPORT = "lastReport",
    SHARES_BALANCE = "balanceOf",
    PRICE_PER_SHARE = "pricePerShare",
    PROFIT_MAX_UNLOCK_TIME = "profitMaxUnlockTime",
    PROFIT_UNLOCKING_RATE = "profitUnlockingRate",
    TOTAL_ASSETS = "totalAssets",
    TOTAL_SHARES = "totalSupply",
}

// Reducer to update contract-read state values that may change intermittently, signaled by contract events that are triggered
const updateDynamicStateReducer = (state, action) => {
    switch (action.type) {
        case TL_DYNAMIC_STATE_VARS.FULL_PROFIT_UNLOCK_DATE:
            return { ...state, [TL_DYNAMIC_STATE_VARS.FULL_PROFIT_UNLOCK_DATE]: BigNumber.from(action.payload) };
        case TL_DYNAMIC_STATE_VARS.IS_SHUTDOWN:
            return { ...state, [TL_DYNAMIC_STATE_VARS.IS_SHUTDOWN]: action.payload };
        case TL_DYNAMIC_STATE_VARS.LAST_REPORT:
            return { ...state, [TL_DYNAMIC_STATE_VARS.LAST_REPORT]: BigNumber.from(action.payload) };
        case TL_DYNAMIC_STATE_VARS.SHARES_BALANCE:
            return { ...state, [TL_DYNAMIC_STATE_VARS.SHARES_BALANCE]: BigNumber.from(action.payload) };
        case TL_DYNAMIC_STATE_VARS.PRICE_PER_SHARE:
            return { ...state, [TL_DYNAMIC_STATE_VARS.PRICE_PER_SHARE]: BigNumber.from(action.payload) };
        case TL_DYNAMIC_STATE_VARS.PROFIT_MAX_UNLOCK_TIME:
            return { ...state, [TL_DYNAMIC_STATE_VARS.PROFIT_MAX_UNLOCK_TIME]: BigNumber.from(action.payload) };
        case TL_DYNAMIC_STATE_VARS.TOTAL_ASSETS:
            return { ...state, [TL_DYNAMIC_STATE_VARS.TOTAL_ASSETS]: BigNumber.from(action.payload) };
        case TL_DYNAMIC_STATE_VARS.TOTAL_SHARES:
            return { ...state, [TL_DYNAMIC_STATE_VARS.TOTAL_SHARES]: BigNumber.from(action.payload) };
        default:
            return state;
    }
};

export const EthTransmuterLooper = () => {
    const chain = useChain();
    const mutationCallback = useWriteContractMutationCallback();
    const { address } = useAccount();

    const [hasFetchedInitially, setHasFetchedInitially] = useState(false); // to limit rpc calls for contract reads only needed once
    const [open, setOpen] = useState(false); // used to toggle the animation pane closed/open
    const [amount, setAmount] = useState(""); // represents amount of assets or shares depending on deposit or withdraw state
    const [previewedOutput, setPreviewedOutput] = useState(""); // represents the previewed output in shares or assets of a deposit or withdraw
    const [isWithdraw, setIsWithdraw] = useState(false); // sets state of token input to accept input in assets or input in shares
    const [isInfiniteApproval, setIsInfiniteApproval] = useState(false);

    const [transmuterLooperContractDynamicState, dispatchTlDynamicStateUpdate] = (useReducer as any)(updateDynamicStateReducer, {
        [TL_DYNAMIC_STATE_VARS.FULL_PROFIT_UNLOCK_DATE]: null,
        [TL_DYNAMIC_STATE_VARS.IS_SHUTDOWN]: null,
        [TL_DYNAMIC_STATE_VARS.LAST_REPORT]: null,
        [TL_DYNAMIC_STATE_VARS.SHARES_BALANCE]: null,
        [TL_DYNAMIC_STATE_VARS.PRICE_PER_SHARE]: null,
        [TL_DYNAMIC_STATE_VARS.PROFIT_UNLOCKING_RATE]: null,
        [TL_DYNAMIC_STATE_VARS.PROFIT_MAX_UNLOCK_TIME]: null,
        [TL_DYNAMIC_STATE_VARS.TOTAL_ASSETS]: null,
        [TL_DYNAMIC_STATE_VARS.TOTAL_SHARES]: null
    });

    const { address: TRANSMUTER_LOOPER_ADDRESS, abi: transmuterLooperImplAbi } = useMemo(
        () => TRANSMUTER_LOOPERS_VAULTS[chain.id].find((vault) => vault.synthAsset === SYNTH_ASSETS.ALETH),
        []
    );

    // ** INITIAL CONTRACT READS ** //
    // Read these contract functions once when the component renders for the first time. Return refetch functions for
    // anything that may need a value updated, and store those initial vals in dynamic state vars
    const { data: transmuterLooperContractStaticState } = useReadContracts({
        enabled: !hasFetchedInitially,
        allowFailure: false,
        contracts: [
            {   // Get the underlying asset for the strategy.
                address: TRANSMUTER_LOOPER_ADDRESS,
                    abi: tokenizedStrategyAbi,
                functionName: "asset",
                chainId: chain.id
            },
            {   // Get the decimals used for the strategy and `asset`.
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: tokenizedStrategyAbi,
                functionName: "decimals",
                chainId: chain.id
            },
            {   // Get the name the strategy is using for it's token
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: tokenizedStrategyAbi,
                functionName: "name",
                chainId: chain.id
            },
            {   // Get the performance fee charged on profits.
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: tokenizedStrategyAbi,
                functionName: "performanceFee",
                chainId: chain.id
            },
            {   // Get the max the owner can deposit in asset.
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: tokenizedStrategyAbi,
                functionName: "maxDeposit",
                chainId: chain.id,
                args: [address!]
            },
            {   // Get the max the owner can mint in shares.
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: tokenizedStrategyAbi,
                functionName: "maxMint",
                chainId: chain.id,
                args: [address!]
            },
            {   // Get the max amount of shares the owner can redeem
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: tokenizedStrategyAbi,
                functionName: "maxRedeem",
                chainId: chain.id,
                args: [address!]
            },
            {   // Get the max amount of assets the owner can withdraw
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: tokenizedStrategyAbi,
                functionName: "maxWithdraw",
                chainId: chain.id,
                args: [address!]
            },
            {   // Gets the symbol the strategy is using for its tokens as a string. (yvSymbol)
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: tokenizedStrategyAbi,
                functionName: "symbol",
                chainId: chain.id,
            },
            {   // The address of the Transmuter this vault utilizes
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: transmuterLooperImplAbi,
                functionName: "transmuter",
                chainId: chain.id
            },
            {   // The address of the underlying token for the Transmuter this vault utilizes
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: transmuterLooperImplAbi,
                functionName: "underyling",
                chainId: chain.id
            },
            {   // Gets the max amount of `asset` that an address can deposit.
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: transmuterLooperImplAbi,
                functionName: "availableDepositLimit",
                chainId: chain.id,
                args: [address!]
            },
            {   // Gets the max amount of `asset` that can be withdrawn for an address.
                address: TRANSMUTER_LOOPER_ADDRESS,
                abi: transmuterLooperImplAbi,
                functionName: "availableWithdrawLimit",
                chainId: chain.id,
                args: [address!]
            },
        ],
        query: {
            select: (
                [
                    sharesTokenAddress,
                    decimals,
                    shareTokenName,
                    performanceFeeInBps,
                    maxDeposit,
                    maxMint,
                    maxRedeem,
                    maxWithdraw,
                    symbol,
                    transmuterAddress,
                    underlyingAssetAddress,
                    availableDepositLimit,
                    availableWithdrawLimit
                ]) => {
                setHasFetchedInitially(true);
                return [
                    sharesTokenAddress,
                    Number(decimals),
                    shareTokenName,
                    performanceFeeInBps / 100,
                    BigNumber.from(maxDeposit),
                    BigNumber.from(maxMint),
                    BigNumber.from(maxRedeem),
                    BigNumber.from(maxWithdraw),
                    symbol,
                    transmuterAddress,
                    underlyingAssetAddress,
                    BigNumber.from(availableDepositLimit),
                    BigNumber.from(availableWithdrawLimit)
                ]
            }
        }
    });

    // Refetch functions for contract read values that may change due to some event, or user interactions, etc.
    const { refetch: refetchFullProfitUnlock } = useReadContract(
        {   // Get the timestamp at which all profits will unlock.
            address: TRANSMUTER_LOOPER_ADDRESS,
            abi: tokenizedStrategyAbi,
            functionName: "fullProfitUnlockDate",
            chainId: chain.id,
            query: {
                select: (fullProfitUnlockDate) => {
                    // Update state var for contract value that is updated intermittently, outside of user interactions
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.FULL_PROFIT_UNLOCK_DATE, payload: fullProfitUnlockDate });
                    return []; // doesn't matter, not used
                }
            }
        }
    );
    useReadContract( // Return value not needed for anything, state set in select callback/event shuts down the strat meaning always a truthy return val
        {   // Get status on whether the strategy is shut down.
            address: TRANSMUTER_LOOPER_ADDRESS,
            abi: tokenizedStrategyAbi,
            functionName: "isShutdown",
            chainId: chain.id,
            query: {
                select: (isShutdown) => {
                    // Update state var for contract value that is updated intermittently, outside of user interactions
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.IS_SHUTDOWN, payload: isShutdown });
                    return []; // doesn't matter, not used
                }
            }
        },
    );
    const { refetch: refetchLastReport } = useReadContract(
        {   // Get the timestamp at which all profits will unlock.
            address: TRANSMUTER_LOOPER_ADDRESS,
            abi: tokenizedStrategyAbi,
            functionName: "lastReport",
            chainId: chain.id,
            query: {
                select: (lastReport) => {
                    // Update state var for contract value that is updated intermittently, outside of user interactions
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.LAST_REPORT, payload: lastReport });
                    return []; // doesn't matter, not used
                }
            }
        }
    );
    const { refetch: refetchSharesBalance } = useReadContract(
        {   // Get the current balance in y shares of the address or account.
            address: TRANSMUTER_LOOPER_ADDRESS,
            abi: tokenizedStrategyAbi,
            functionName: "balanceOf",
            chainId: chain.id,
            args: [address!],
            query: {
                select: (balanceOf) => {
                    // Update state var for contract value that is updated intermittently, outside of user interactions
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.SHARES_BALANCE, payload: balanceOf });
                    return []; // doesn't matter, not used
                }
            }
        },
    );
    const { refetch: refetchPricePerShare } = useReadContract(
        {   // Get the price in asset per share
            address: TRANSMUTER_LOOPER_ADDRESS,
            abi: tokenizedStrategyAbi,
            functionName: "pricePerShare",
            chainId: chain.id,
            query: {
                select: (pricePerShare) => {
                    // Update state var for contract value that is updated intermittently, outside of user interactions
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.PRICE_PER_SHARE, payload: pricePerShare });
                    return []; // doesn't matter, not used
                }
            }
        },
    );
    const { refetch: refetchProfitMaxUnlockTime } = useReadContract(
        {   // Gets the current time profits are set to unlock over as uint.
            address: TRANSMUTER_LOOPER_ADDRESS,
            abi: tokenizedStrategyAbi,
            functionName: "profitMaxUnlockTime",
            chainId: chain.id,
            query: {
                select: (profitMaxUnlockTime) => {
                    // Update state var for contract value that is updated intermittently, outside of user interactions
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.PROFIT_MAX_UNLOCK_TIME, payload: profitMaxUnlockTime });
                    return []; // doesn't matter, not used
                }
            }
        }
    );
    const { refetch: refetchProfitUnlockingRate } = useReadContract(
        {   // Gets the current time profits are set to unlock over as uint.
            address: TRANSMUTER_LOOPER_ADDRESS,
            abi: tokenizedStrategyAbi,
            functionName: "profitUnlockingRate",
            chainId: chain.id,
            query: {
                select: (profitUnlockingRate) => {
                    // Update state var for contract value that is updated intermittently, outside of user interactions
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.PROFIT_UNLOCKING_RATE, payload: profitUnlockingRate });
                    return []; // doesn't matter, not used
                }
            }
        }
    );
    const { refetch: refetchTotalAssets } = useReadContract(
        {   // Gets the current time profits are set to unlock over as uint.
            address: TRANSMUTER_LOOPER_ADDRESS,
            abi: tokenizedStrategyAbi,
            functionName: "totalAssets",
            chainId: chain.id,
            query: {
                select: (totalAssets) => {
                    // Update state var for contract value that is updated intermittently, outside of user interactions
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.PROFIT_UNLOCKING_RATE, payload: totalAssets });
                    return []; // doesn't matter, not used
                }
            }
        }
    );
    const { refetch: refetchTotalShares } = useReadContract(
        {   // Gets the current time profits are set to unlock over as uint.
            address: TRANSMUTER_LOOPER_ADDRESS,
            abi: tokenizedStrategyAbi,
            functionName: "totalSupply",
            chainId: chain.id,
            query: {
                select: (totalSupply) => {
                    // Update state var for contract value that is updated intermittently, outside of user interactions
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.PROFIT_UNLOCKING_RATE, payload: totalSupply });
                    return []; // doesn't matter, not used
                }
            }
        }
    );

    /** EVENT TRIGGERED CONTRACT READS **/
    // Call these contract functions as values change based on emitted contract events
    useWatchContractEvent({
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        eventName: "Reported",
        onLogs(_) {
            refetchFullProfitUnlock()
                .then(fullProfitUnlockDate => {
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.FULL_PROFIT_UNLOCK_DATE, payload: fullProfitUnlockDate });
                })
                .error(error => {
                    toast.warning(`Refetch of fullProfitUnlock failed.`, {
                        description: `Failed to refetch data after Reported event was emitted. ${error || ''}`
                    });
                    // todo - log to site log?
                });

            refetchLastReport()
                .then(lastReport => {
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.LAST_REPORT, payload: lastReport });
                })
                .error(error => {
                    toast.warning(`Refetch of lastReport failed.`, {
                        description: `Failed to refetch data after Reported event was emitted. ${error || ''}`
                    });
                    // todo - log to site log?
                });

            refetchPricePerShare()
                .then(pricePerShare => {
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.PRICE_PER_SHARE, payload: pricePerShare });
                })
                .error(error => {
                    toast.warning(`Refetch of pricePerShare failed.`, {
                        description: `Failed to refetch data after Reported event was emitted. ${error || ''}`
                    });
                    // todo - log to site log?
                });

            refetchProfitUnlockingRate()
                .then(profitUnlockingRate => {
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.PROFIT_UNLOCKING_RATE, payload: profitUnlockingRate });
                })
                .error(error => {
                    toast.warning(`Refetch of profitUnlockingRate failed.`, {
                        description: `Failed to refetch data after Reported event was emitted. ${error || ''}`
                    });
                    // todo - log to site log?
                });

            refetchProfitMaxUnlockTime()
                .then(profitMaxUnlockTime => {
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.PROFIT_MAX_UNLOCK_TIME, payload: profitMaxUnlockTime });
                })
                .error(error => {
                    toast.warning(`Refetch of profitMaxUnlockTime failed.`, {
                        description: `Failed to refetch data after Reported event was emitted. ${error || ''}`
                    });
                    // todo - log to site log?
                });

            refetchTotalShares()
                .then(totalShares => {
                    dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.TOTAL_SHARES, payload: totalShares });
                })
                .error(error => {
                    toast.warning(`Refetch of totalShares failed.`, {
                        description: `Failed to refetch data after Reported event was emitted. ${error || ''}`
                    });
                    // todo - log to site log?
                });
        },
    });

    useWatchContractEvent({
        address: TRANSMUTER_LOOPER_ADDRESS,
        abi: tokenizedStrategyAbi,
        eventName: "StrategyShutdown",
        onLogs(logs) {
            dispatchTlDynamicStateUpdate({ type: TL_DYNAMIC_STATE_VARS.IS_SHUTDOWN, payload: true });
        }
    });

    /** CONTRACT WRITES **/
    /**
     * Get allowance info for alETH
     */
    const { isApprovalNeeded, alETHApproveConfig, approveSpendAlETH } = useAllowance({
        tokenAddress: SYNTH_ASSETS_ADDRESSES[mainnet.id][SYNTH_ASSETS.ALETH],
        spender: TRANSMUTER_LOOPER_ADDRESS,
        amount,
        decimals: transmuterLooperContractStaticState?.decimals || 18,
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
    };

    // Calculates and sets previewedOutput for a deposit or withdraw for display purposes
    useEffect(() => {
        // Reuses contract logic of _convertToShares for a front end estimation so as not to trigger many RPC calls
        const previewDeposit = () => {
            // Get inputted assetsToDeposit, totalAssets, and totalSupply as BigNumbers
            const assetsToDeposit = parseEther(amount); // TODO -- need to validate this input otherwise an error will be thrown. Does token input do this?
            const totalAssets = BigInt(transmuterLooperContractDynamicState[TL_DYNAMIC_STATE_VARS.TOTAL_ASSETS] || 0);
            const totalSupply = BigInt(transmuterLooperContractDynamicState[TL_DYNAMIC_STATE_VARS.TOTAL_SHARES] || 0);

            // If assets are 0 but supply is not PPS = 0.
            if (totalAssets === BigInt(0)) {
                return totalSupply === BigInt(0) ? formatEther(assetsToDeposit) : 0;
            }

            // Perform multiplication and division using BigNumber operations to mimic:
            // assets.mulDiv(totalSupply_, totalAssets_, _rounding);
            // js truncation handles _rounding = down in the contract call.
            const expectedShares = (assetsToDeposit * totalSupply) / totalAssets;
            return formatEther(expectedShares.toString());
        }

        // Reuses contract logic of _convertToAssets for a front end estimation so as not to trigger many RPC calls
        const previewRedeem = () => {
            // Get inputted sharesToRedeem, totalAssets, and totalSupply as BigNumbers
            const sharesToRedeem = parseEther(amount); // TODO -- need to validate this input otherwise an error will be thrown. Does token input do this?
            const totalAssets = BigInt(transmuterLooperContractDynamicState[TL_DYNAMIC_STATE_VARS.TOTAL_ASSETS] || 0);
            const totalSupply = BigInt(transmuterLooperContractDynamicState[TL_DYNAMIC_STATE_VARS.TOTAL_SHARES] || 0);

            if (totalSupply == BigInt(0)) {
                return totalSupply == BigInt(0) ? formatEther(sharesToRedeem) : 0;
            }

            // Perform multiplication and division using BigNumber operations to mimic:
            // shares.mulDiv(_totalAssets(S), supply, _rounding);
            // js truncation handles _rounding = down in the contract call.
            const expectedAssets = (sharesToRedeem * totalAssets) / totalSupply;
            return formatEther(expectedAssets.toString());
        }

        setPreviewedOutput(isWithdraw ? (previewRedeem() as string) : (previewDeposit() as string));
    }, [amount, transmuterLooperContractDynamicState, isWithdraw]);

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
                                                isWithdraw ? TRANSMUTER_LOOPER_ADDRESS : SYNTH_ASSETS_ADDRESSES[mainnet.id][SYNTH_ASSETS.ALETH]
                                            }
                                            // TODO -- can probably remove overrideBalance when real contract address is ready
                                            overrideBalance={isWithdraw ? (transmuterLooperContractDynamicState[TL_DYNAMIC_STATE_VARS.SHARES_BALANCE] || 0) : undefined}
                                            tokenDecimals={transmuterLooperContractStaticState?.decimals || 18}
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
                                    <p className="mb-4">
                                        An alETH Transmuter Looping Vault.
                                    </p>
                                    <p className="mb-2 text-sm">
                                        Deposit your alETH into yvAlETH to have your alETH perpetually staked in the transmuter,
                                        with profits in ETH recycled into alETH at a discount, for a perpetual yield on alETH over time.
                                    </p>
                                    <p className="text-sm">
                                        Transmuter looping increases the amount of alETH you can get per
                                        shares of yvAlETH over time.
                                    </p>
                                </div>
                                <div className="flex w-full flex-col justify-between gap-6 rounded border-grey10inverse bg-grey10inverse p-4 lg:flex-row dark:border-grey10 dark:bg-grey10">
                                    <div className="flex-col">
                                        <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
                                            yvAlETH Token Supply
                                        </div>
                                        <div className="flex">
                                            <div className="mr-2 flex">
                                                {formatNumber(transmuterLooperContractDynamicState[TL_DYNAMIC_STATE_VARS.TOTAL_SHARES])}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-col">
                                        <div className="mr-2 whitespace-nowrap text-sm uppercase text-bronze3">
                                            alETH deposited to yvAlETH
                                        </div>
                                        <div className="flex">
                                            <div className="mr-2 flex">
                                                {formatNumber(transmuterLooperContractDynamicState[TL_DYNAMIC_STATE_VARS.TOTAL_ASSETS])}
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
