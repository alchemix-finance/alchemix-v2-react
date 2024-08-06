// NOTE: We import this whole module lazily.
// This would not cause a bundle size increase.
// Type imports also get eliminated during compilation.
import type { SdkConfig } from "@connext/sdk";
import { useEthersSigner } from "@/hooks/useEthersSigner";

import { QueryKeys } from "@/lib/queries/queriesSchema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount, useSwitchChain } from "wagmi";
import { useCallback, useState } from "react";
import {
  formatEther,
  isAddress,
  parseEther,
  parseUnits,
  zeroAddress,
} from "viem";
import { toast } from "sonner";
import { arbitrum, mainnet, optimism } from "viem/chains";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import {
  ALCX_MAINNET_ADDRESS,
  ALCX_ARBITRUM_ADDRESS,
  ALCX_OPTIMISM_ADDRESS,
} from "@/lib/constants";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { TokenInput } from "@/components/common/input/TokenInput";
import { SlippageInput } from "@/components/common/input/SlippageInput";
import { Button } from "@/components/ui/button";
import { isInputZero } from "@/utils/inputNotZero";
import { SYNTH_ASSETS_ADDRESSES } from "@/lib/config/synths";
import { useChain } from "@/hooks/useChain";
import { formatNumber } from "@/utils/number";

const sdkConfig = {
  network: "mainnet",
  chains: {
    // ETH
    6648936: {
      chainId: 1,
      providers: ["https://ethereum-rpc.publicnode.com"],
    },
    // OP
    1869640809: {
      chainId: 10,
      providers: ["https://optimism-rpc.publicnode.com"],
    },
    // ARB
    1634886255: {
      chainId: 42161,
      providers: ["https://arbitrum-one.publicnode.com"],
    },
  },
  // Turn down connext sdk logs in production.
  logLevel: "silent",
} as const satisfies SdkConfig;

const chainIdToDomainMapping = {
  [mainnet.id.toString()]: "6648936",
  [optimism.id.toString()]: "1869640809",
  [arbitrum.id.toString()]: "1634886255",
} as const;

const chainToAvailableTokensMapping = {
  [mainnet.id.toString()]: [
    ALCX_MAINNET_ADDRESS,
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alETH,
    SYNTH_ASSETS_ADDRESSES[mainnet.id].alUSD,
  ].map((t) => t.toLowerCase()),

  [optimism.id.toString()]: [
    ALCX_OPTIMISM_ADDRESS,
    SYNTH_ASSETS_ADDRESSES[optimism.id].alETH,
    SYNTH_ASSETS_ADDRESSES[optimism.id].alUSD,
  ].map((t) => t.toLowerCase()),

  [arbitrum.id.toString()]: [
    ALCX_ARBITRUM_ADDRESS,
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alETH,
    SYNTH_ASSETS_ADDRESSES[arbitrum.id].alUSD,
  ].map((t) => t.toLowerCase()),
};

const bridgeChains = [mainnet, optimism, arbitrum];

export const ConnextBridgeWidget = () => {
  const chain = useChain();

  const [originChainId, setOriginChainId] = useState(chain.id.toString());
  const originDomain = chainIdToDomainMapping[originChainId];
  const originChain = bridgeChains.find(
    (c) => c.id.toString() === originChainId,
  );

  const [destinationChainId, setDestinationChainId] = useState(
    bridgeChains.find((c) => c.id.toString() !== originChainId)!.id.toString(),
  );
  const destinationDomain = chainIdToDomainMapping[destinationChainId];
  const destinationChain = bridgeChains.find(
    (c) => c.id.toString() === destinationChainId,
  );

  const { data: tokens } = useTokensQuery();
  const [originTokenAddress, setOriginTokenAddress] = useState(
    chainToAvailableTokensMapping[originChainId][0],
  );
  const token = tokens?.find(
    (t) => t.address.toLowerCase() === originTokenAddress.toLowerCase(),
  );
  const selection = tokens?.filter((t) =>
    chainToAvailableTokensMapping[originChainId].includes(
      t.address.toLowerCase(),
    ),
  );

  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const { data: relayerFee } = useRelayerFee({
    originDomain,
    destinationDomain,
  });
  const { data: amountOut, isFetching: isFetchingAmountOut } = useAmountOut({
    originDomain,
    destinationDomain,
    originTokenAddress,
    amount,
  });

  const { data: approveData } = useConnextApproval({
    originDomain,
    originTokenAddress,
    amount,
  });

  const notReady =
    isFetchingAmountOut ||
    approveData === undefined ||
    relayerFee === undefined ||
    amountOut === undefined;

  const { mutate: writeApprove, isPending: isApproving } = useApprove();
  const { mutate: writeBridge, isPending: isBridging } = useBridge();

  const { switchChain } = useSwitchChain();

  const handleOriginChainSelect = useCallback(
    (chainId: string) => {
      setOriginChainId(chainId);
      const newChainTokenAddress = chainToAvailableTokensMapping[chainId][0];
      if (isAddress(newChainTokenAddress)) {
        setOriginTokenAddress(newChainTokenAddress);
      }
      setAmount("");
      if (chainId === destinationChainId) {
        const newDestinationChainId = bridgeChains
          .find((c) => c.id.toString() !== chainId)
          ?.id.toString();
        if (newDestinationChainId) {
          setDestinationChainId(newDestinationChainId);
        }
      }
      switchChain({
        chainId: Number(chainId),
      });
    },
    [destinationChainId, switchChain],
  );

  const handleDestinationChainSelect = useCallback(
    (chainId: string) => {
      setDestinationChainId(chainId);
      setAmount("");
      if (chainId === originChainId) {
        const newOriginChainId = bridgeChains
          .find((c) => c.id.toString() !== chainId)
          ?.id.toString();
        if (newOriginChainId) {
          setOriginChainId(newOriginChainId);
          switchChain({
            chainId: Number(newOriginChainId),
          });
          const newChainTokenAddress =
            chainToAvailableTokensMapping[newOriginChainId][0];
          if (isAddress(newChainTokenAddress)) {
            setOriginTokenAddress(newChainTokenAddress);
          }
        }
      }
    },
    [originChainId, switchChain],
  );

  const onCtaClick = useCallback(() => {
    if (!approveData) return;
    if (approveData?.isApprovalNeeded === true) {
      writeApprove({ approveData });
      return;
    }
    if (!relayerFee) return;
    writeBridge({
      originDomain,
      destinationDomain,
      originTokenAddress,
      amount,
      slippage,
      relayerFee,
    });
  }, [
    amount,
    approveData,
    destinationDomain,
    originDomain,
    originTokenAddress,
    relayerFee,
    slippage,
    writeApprove,
    writeBridge,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-2">
          <p>Origin chain:</p>
          <Select value={originChainId} onValueChange={handleOriginChainSelect}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Origin chain">
                {originChain?.name ?? "Error"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bridgeChains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <p>Target chain:</p>
          <Select
            value={destinationChainId}
            onValueChange={handleDestinationChainSelect}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Target chain">
                {destinationChain?.name ?? "Error"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {bridgeChains.map((chain) => (
                <SelectItem key={chain.id} value={chain.id.toString()}>
                  {chain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <p>Router fee:</p>
          <Input
            value={formatNumber(amountOut?.routerFee)}
            readOnly
            aria-readonly
            type="text"
            className="text-right"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Relayer fee:</p>
          <Input
            value={formatNumber(relayerFee, 5)}
            readOnly
            aria-readonly
            type="text"
            className="text-right"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>You receive:</p>
          <Input
            value={
              isFetchingAmountOut
                ? "Loading"
                : formatNumber(amountOut?.amountReceived)
            }
            readOnly
            aria-readonly
            type="text"
            className="text-right"
          />
        </div>
      </div>
      <div className="flex rounded border border-grey3inverse bg-grey3inverse dark:border-grey3 dark:bg-grey3">
        <Select
          value={originTokenAddress}
          onValueChange={(value) =>
            setOriginTokenAddress(value as `0x${string}`)
          }
        >
          <SelectTrigger className="h-auto w-56">
            <SelectValue placeholder="Token" asChild>
              <div className="flex items-center gap-4">
                <img
                  src={`/images/token-icons/${token?.symbol}.svg`}
                  alt={token?.symbol}
                  className="h-12 w-12"
                />
                <span className="text-xl">{token?.symbol}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {selection?.map((token) => (
              <SelectItem key={token.address} value={token.address}>
                {token.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <TokenInput
          amount={amount}
          setAmount={setAmount}
          tokenAddress={token?.address ?? zeroAddress}
          tokenSymbol={token?.symbol ?? ""}
          tokenDecimals={18}
        />
      </div>
      <SlippageInput slippage={slippage} setSlippage={setSlippage} />
      <Button
        variant="outline"
        width="full"
        disabled={isInputZero(amount) || notReady || isApproving || isBridging}
        onClick={onCtaClick}
      >
        {isApproving || isBridging
          ? "Loading"
          : approveData?.isApprovalNeeded === true
            ? "Approve"
            : "Bridge"}
      </Button>
    </div>
  );
};

const useConnextSdk = () => {
  const { address } = useAccount();
  return useQuery({
    queryKey: [QueryKeys.ConnextSdk("init"), address],
    queryFn: async () => {
      const create = await import("@connext/sdk").then((mod) => mod.create);
      const sdk = await create({ ...sdkConfig, signerAddress: address });
      return sdk.sdkBase;
    },
    staleTime: Infinity,
  });
};

const useRelayerFee = ({
  originDomain,
  destinationDomain,
}: {
  originDomain: string;
  destinationDomain: string;
}) => {
  const { data: connextSdk } = useConnextSdk();
  return useQuery({
    queryKey: [
      QueryKeys.ConnextSdk("relayerFee"),
      connextSdk,
      originDomain,
      destinationDomain,
    ],
    queryFn: async () => {
      if (!connextSdk) throw new Error("SDK not ready");
      const relayerFeeBN = await connextSdk.estimateRelayerFee({
        originDomain,
        destinationDomain,
      });
      const relayerFee = formatEther(BigInt(relayerFeeBN.toString()));
      return relayerFee;
    },
    enabled: !!connextSdk,
    staleTime: Infinity,
  });
};

const useAmountOut = ({
  originDomain,
  destinationDomain,
  originTokenAddress,
  amount,
}: {
  originDomain: string;
  destinationDomain: string;
  originTokenAddress: string;
  amount: string;
}) => {
  const { data: connextSdk } = useConnextSdk();
  return useQuery({
    queryKey: [
      QueryKeys.ConnextSdk("amountOut"),
      connextSdk,
      originDomain,
      destinationDomain,
      originTokenAddress,
      amount,
    ],
    queryFn: async () => {
      if (!connextSdk) throw new Error("SDK not ready");
      const { amountReceived, routerFee } =
        await connextSdk.calculateAmountReceived(
          originDomain,
          destinationDomain,
          originTokenAddress,
          // uint256 in string
          parseEther(amount).toString(),
        );

      return {
        amountReceived: formatEther(BigInt(amountReceived.toString())),
        routerFee: formatEther(BigInt(routerFee.toString())),
      };
    },
    enabled: !!connextSdk && !isInputZero(amount),
  });
};

const useConnextApproval = ({
  originDomain,
  originTokenAddress,
  amount,
}: {
  originDomain: string;
  originTokenAddress: string;
  amount: string;
}) => {
  const { data: connextSdk } = useConnextSdk();
  return useQuery({
    queryKey: [
      QueryKeys.ConnextSdk("approval"),
      connextSdk,
      originDomain,
      originTokenAddress,
      amount,
    ],
    queryFn: async () => {
      if (!connextSdk) throw new Error("SDK not ready");
      const approveTx = await connextSdk.approveIfNeeded(
        originDomain,
        originTokenAddress,
        // uint256 in string
        parseEther(amount).toString(),
        // fixes approval
        false,
      );
      if (!approveTx)
        return {
          isApprovalNeeded: false,
          approveTx: undefined,
        } as const;
      return {
        isApprovalNeeded: true,
        approveTx,
      } as const;
    },
    enabled: !!connextSdk && !isInputZero(amount),
  });
};

const useApprove = () => {
  const signer = useEthersSigner();
  return useMutation({
    mutationFn: async ({
      approveData,
    }: {
      approveData: ReturnType<typeof useConnextApproval>["data"] | undefined;
    }) => {
      if (!signer) throw new Error("Signer not ready");
      if (!approveData) throw new Error("Approval data not ready");
      if (!approveData.isApprovalNeeded) throw new Error("Approval not needed");
      const approveTxReq = approveData.approveTx;
      const approveTx = await signer.sendTransaction(approveTxReq);
      toast.promise(
        () =>
          new Promise((resolve, reject) =>
            approveTx
              .wait()
              .then((receipt) => (receipt.status === 1 ? resolve : reject)),
          ),
        {
          loading: "Bridging...",
          success: "Bridge success!",
          error: "Bridge failed.",
        },
      );
      await approveTx.wait();
    },
  });
};

const useBridge = () => {
  const { address } = useAccount();
  const signer = useEthersSigner();

  const { data: connextSdk } = useConnextSdk();
  return useMutation({
    mutationFn: async ({
      originDomain,
      destinationDomain,
      originTokenAddress,
      amount,
      slippage,
      relayerFee,
    }: {
      originDomain: string;
      destinationDomain: string;
      originTokenAddress: string;
      amount: string; // uint256 in string
      slippage: string; // in %
      relayerFee: string; // in wei
    }) => {
      if (!connextSdk) throw new Error("SDK not ready");
      if (!address) throw new Error("Not connected");
      if (!signer) throw new Error("Signer not ready");
      if (!relayerFee) throw new Error("Relayer fee not ready");
      const bridgeTxParams = {
        origin: originDomain,
        destination: destinationDomain,
        to: address,
        asset: originTokenAddress,
        delegate: address,
        callData: "0x",
        // uint256 in string
        amount: parseEther(amount).toString(),
        // uint256 in string
        relayerFee: parseEther(relayerFee).toString(),
        // in BPS (basis points) in string
        slippage: parseUnits(slippage, 2).toString(),
      };
      const xcallTxReq = await connextSdk.xcall(bridgeTxParams);
      const xcallTx = await signer.sendTransaction(xcallTxReq);
      toast.promise(
        () =>
          new Promise((resolve, reject) =>
            xcallTx
              .wait()
              .then((receipt) => (receipt.status === 1 ? resolve : reject)),
          ),
        {
          loading: "Bridging...",
          success: "Bridge success!",
          error: "Bridge failed.",
        },
      );
      await xcallTx.wait();
    },
  });
};
