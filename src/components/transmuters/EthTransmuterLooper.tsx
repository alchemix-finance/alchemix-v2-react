import { useEffect, useState } from "react";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import {
  useAccount,
  useReadContracts,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatEther, parseEther, zeroAddress } from "viem";
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
import { fantom } from "viem/chains";
import {
  SupportedTransmuterLooperChainId,
  TransmuterMetadata,
} from "@/lib/config/metadataTypes";
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
  useApproveInputToken,
  useCheckApproval,
  usePortalQuote,
  useSendPortalTransaction,
} from "@/hooks/usePortal";

export const EthTransmuterLooper = ({
  transmuterLooper,
}: {
  transmuterLooper: TransmuterMetadata;
}) => {
  const chain = useChain();
  const mutationCallback = useWriteContractMutationCallback();
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
  const wethToken = tokens?.find(
    (token) =>
      chain.id !== fantom.id && token.address === WETH_ADDRESSES[chain.id],
  );
  const alEthToken =
    chain.id !== fantom.id
      ? tokens?.find(
          (token) =>
            token.address ===
            SYNTH_ASSETS_ADDRESSES[chain.id][SYNTH_ASSETS.ALETH],
        )
      : undefined;
  const selection =
    gasToken && wethToken && alEthToken
      ? [gasToken, wethToken, alEthToken]
      : [];
  const token = selection.find(
    (token) => token.address === selectTokenAddress,
  )!;

  // ** INITIAL CONTRACT READS ** //
  // Read these contract functions once when the component renders for the first time. Return refetch functions for
  // anything that may need a value updated, and store those initial vals in dynamic state vars
  const { data: transmuterLooperContractStaticState } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        // Get the underlying asset for the strategy.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "asset",
        chainId: chain.id,
      },
      {
        // Get the decimals used for the strategy and `asset`.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "decimals",
        chainId: chain.id,
      },
      {
        // Get the name the strategy is using for it's token
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "name",
        chainId: chain.id,
      },
      {
        // Get the performance fee charged on profits.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "performanceFee",
        chainId: chain.id,
      },
      {
        // Get the max the owner can deposit in asset.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "maxDeposit",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Get the max the owner can mint in shares.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "maxMint",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Get the max amount of shares the owner can redeem
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "maxRedeem",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Get the max amount of assets the owner can withdraw
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "maxWithdraw",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Gets the symbol the strategy is using for its tokens as a string. (yvSymbol)
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "symbol",
        chainId: chain.id,
      },
    ],
  });
  // TODO: Figure out what we need and what we dont need from this
  // const [sharesTokenAddress,decimals,shareTokenName,performanceFee,maxDeposit,maxMint,maxRedeem,maxWithdraw,symbol]
  const [, decimals, , , maxDeposit, , , , ,] =
    transmuterLooperContractStaticState ?? [];

  /** EVENT TRIGGERED CONTRACT READS **/
  // Read these contract functions initially, but separately as they will be watched and reread per block in case they are updated
  const { data: transmuterLooperContractDynamicState } = useReadContracts({
    scopeKey: ScopeKeys.TransmuterLooperReported,
    allowFailure: false,
    contracts: [
      {
        // Get the timestamp at which all profits will unlock.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "fullProfitUnlockDate",
        chainId: chain.id,
      },
      {
        // Get status on whether the strategy is shut down.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "isShutdown",
        chainId: chain.id,
      },
      {
        // Get the timestamp of the last report
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "lastReport",
        chainId: chain.id,
      },
      {
        // Get the current balance in y shares of the address or account.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "balanceOf",
        chainId: chain.id,
        args: [address!],
      },
      {
        // Get the price in asset per share
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "pricePerShare",
        chainId: chain.id,
      },
      {
        // Gets the current time profits are set to unlock over as uint.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "profitMaxUnlockTime",
        chainId: chain.id,
      },
      {
        // Gets the current time profits are set to unlock over as uint.
        address: transmuterLooper.address,
        abi: tokenizedStrategyAbi,
        functionName: "profitUnlockingRate",
        chainId: chain.id,
      },
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
  // TODO: Figure out what we need and what we dont need from this
  // const [fullProfitUnlockDate,isShutdown,lastReport,balanceOf,pricePerShare,profitMaxUnlockTime,profitUnlockingRate,totalAssets,totalSupply]
  const [, , , , , , , totalAssets, totalSupply] =
    transmuterLooperContractDynamicState ?? [];

  // Watch intermittently updated read values in case they are updated due to the report function or other manual updates to the contract
  useWatchQuery({
    scopeKey: ScopeKeys.TransmuterLooperReported,
  });

  /** PORTAL APPROVAL */
  const { data: checkWethApprovalData } = useCheckApproval(
    address,
    WETH_ADDRESSES[chain.id as SupportedTransmuterLooperChainId],
    amount,
    18,
  );
  const {
    shouldApprove: isWethApprovalNeeded,
    canPermit: isWethEligibleForGaslessSignature,
    approveTx: approveSpendWethTx,
    permit: approveSpendWethSignature,
  } = checkWethApprovalData ?? {};

  const { data: checkSharesApprovalData } = useCheckApproval(
    address,
    transmuterLooper.address,
    amount,
    6,
  );
  const {
    shouldApprove: isSharesApprovalNeeded,
    canPermit: isSharesEligibleForGasslessSignature,
    approveTx: approveSpendSharesTx,
    permit: approveSpendSharesSignature,
  } = checkSharesApprovalData ?? {};

  /** CONTRACT WRITES **/
  /**
   * Get allowance info for alETH and WETH
   */
  const {
    isApprovalNeeded,
    approveConfig: alETHApproveConfig,
    approve: approveSpendAlETH,
  } = useAllowance({
    tokenAddress:
      chain.id !== fantom.id
        ? SYNTH_ASSETS_ADDRESSES[chain.id][SYNTH_ASSETS.ALETH]
        : undefined,
    spender: transmuterLooper.address,
    amount,
    decimals,
    isInfiniteApproval,
  });

  const { mutate: approveSpendWeth, signature: gaslessSignature } =
    useApproveInputToken({
      shouldApprove: isWethApprovalNeeded,
      canPermit: isWethEligibleForGaslessSignature,
      approveTx: approveSpendWethTx,
      permit: approveSpendWethSignature,
    });

  const { mutate: approveSpendShares } = useApproveInputToken({
    shouldApprove: isSharesApprovalNeeded,
    canPermit: isSharesEligibleForGasslessSignature,
    approveTx: approveSpendSharesTx,
    permit: approveSpendSharesSignature,
  });

  /** PORTAL QUOTE */
  const { data: wethOrEthToVaultSharesQuote } = usePortalQuote({
    gaslessSignature,
    inputToken:
      selectTokenAddress === GAS_ADDRESS ? zeroAddress : selectTokenAddress,
    inputTokenDecimals: 18,
    inputAmount: amount,
    outputToken: transmuterLooper.address,
    sender: address,
    shouldQuote:
      selectTokenAddress === GAS_ADDRESS ||
      (selectTokenAddress ===
        WETH_ADDRESSES[chain.id as SupportedTransmuterLooperChainId] &&
        (!isWethApprovalNeeded || !!gaslessSignature))
        ? true
        : false,
  });

  const { data: vaultSharesToETHorWethQuote } = usePortalQuote({
    gaslessSignature,
    inputToken: transmuterLooper.address,
    inputTokenDecimals: 6,
    inputAmount: amount,
    outputToken:
      selectTokenAddress === GAS_ADDRESS ? zeroAddress : selectTokenAddress,
    sender: address,
    shouldQuote:
      (!isSharesApprovalNeeded || gaslessSignature !== undefined) &&
      selectTokenAddress !==
        SYNTH_ASSETS_ADDRESSES[chain.id as SupportedTransmuterLooperChainId][
          SYNTH_ASSETS.ALETH
        ],
  });

  const selectedTokenIsApprovalNeeded =
    selectTokenAddress ===
    SYNTH_ASSETS_ADDRESSES[chain.id as SupportedTransmuterLooperChainId][
      SYNTH_ASSETS.ALETH
    ]
      ? isApprovalNeeded
      : selectTokenAddress === GAS_ADDRESS
        ? false
        : isWethApprovalNeeded && !gaslessSignature;

  /**
   * Configure write contract functions for alETH deposit
   */
  const { data: depositConfig, error: depositError } = useSimulateContract({
    address: transmuterLooper.address,
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
    address: transmuterLooper.address,
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

  /** PORTAL BUNDLER CALLS */
  const { mutate: depositUsingPortal } = useSendPortalTransaction(
    wethOrEthToVaultSharesQuote,
  );
  const { mutate: withdrawUsingPortal } = useSendPortalTransaction(
    vaultSharesToETHorWethQuote,
  );

  useEffect(() => {
    if (redeemReceipt) {
      setAmount("");
    }
  }, [redeemReceipt]);

  /** UI Actions **/
  const onDeposit = async () => {
    if (
      selectTokenAddress === GAS_ADDRESS ||
      (chain.id !== fantom.id &&
        selectTokenAddress === WETH_ADDRESSES[chain.id])
    ) {
      if (
        chain.id !== fantom.id &&
        selectTokenAddress === WETH_ADDRESSES[chain.id] &&
        isWethApprovalNeeded &&
        !gaslessSignature
      ) {
        approveSpendWeth();
      } else {
        depositUsingPortal();
      }
    } else {
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
    }
  };

  const onWithdraw = async () => {
    if (
      chain.id !== fantom.id &&
      selectTokenAddress !==
        SYNTH_ASSETS_ADDRESSES[chain.id][SYNTH_ASSETS.ALETH]
    ) {
      if (isSharesApprovalNeeded) {
        approveSpendShares();
      } else {
        withdrawUsingPortal();
      }
      setAmount("");
    } else {
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
                <div className="flex w-full rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
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
                            src={`/images/token-icons/${token.symbol}.svg`}
                            alt={token.symbol}
                            className="h-12 w-12"
                          />
                          <span className="hidden text-xl sm:inline">
                            {token.symbol}
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
                      isWithdraw ? transmuterLooper.address : selectTokenAddress
                    }
                    tokenDecimals={
                      // TODO -- put this back when contract is deployed, and remove below condition which tests using a USDC vault with 6 decimals
                      /*
                      decimals ?? 18
                      */
                      isWithdraw ? 6 : 18
                    }
                    tokenSymbol={isWithdraw ? "yvAlETH" : token.symbol}
                    dustToZero={isWithdraw}
                  />
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
                {selectTokenAddress &&
                  chain.id !== fantom.id &&
                  selectTokenAddress !==
                    SYNTH_ASSETS_ADDRESSES[chain.id][SYNTH_ASSETS.ALETH] && (
                    <SlippageInput
                      slippage={slippage}
                      setSlippage={setSlippage}
                    />
                  )}
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
                  {isWithdraw
                    ? isSharesApprovalNeeded
                      ? "Approve Spend shares"
                      : "Withdraw"
                    : selectedTokenIsApprovalNeeded
                      ? `Approve Spend ${token.symbol}`
                      : "Deposit"}
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
                        {formatNumber(totalSupplyFormatted)}
                      </div>
                    </div>
                  </div>
                  <div className="flex-col">
                    <div className="mr-2 whitespace-nowrap text-sm text-bronze3">
                      alETH Deposited To yvAlETH
                    </div>
                    <div className="flex">
                      <div className="mr-2 flex">
                        {formatNumber(totalAssetsFormatted)}
                      </div>
                    </div>
                  </div>
                  <div className="flex-col">
                    <div className="mr-2 whitespace-nowrap text-sm text-bronze3">
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
