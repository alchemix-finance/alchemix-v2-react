// NOTE: We import this whole module lazily.
// This would not cause a bundle size increase.
// Type imports also get eliminated during compilation.
import type { SdkConfig } from "@connext/sdk";
import { useEthersSigner } from "@/hooks/useEthersSigner";

import { QueryKeys } from "@/lib/queries/queriesSchema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useCallback, useState } from "react";
import { parseUnits } from "viem";
import { toast } from "sonner";
import { arbitrum, mainnet, optimism } from "viem/chains";

const sdkConfig = {
  network: "mainnet",
  chains: {
    // ETH
    6648936: {
      chainId: 1,
    },
    // OP
    1869640809: {
      chainId: 10,
    },
    // ARB
    1634886255: {
      chainId: 42161,
    },
  },
  // Turn down connext sdk logs in production.
  logLevel: import.meta.env.PROD ? "silent" : "info",
} as const satisfies SdkConfig;

const chainIdToDomainMapping = {
  [mainnet.id]: "6648936",
  [optimism.id]: "1869640809",
  [arbitrum.id]: "1634886255",
};

export const ConnextBridgeWidget = () => {
  const [originChainId, setOriginChainId] = useState(mainnet.id);
  const originDomain = chainIdToDomainMapping[originChainId];

  const [destinationChainId, setDestinationChainId] = useState(arbitrum.id);
  const destinationDomain = chainIdToDomainMapping[destinationChainId];

  const [originTokenAddress, setOriginTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("");

  const { data: relayerFee } = useRelayerFee({
    originDomain,
    destinationDomain,
  });
  const { data: amountOut } = useAmountOut({
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

  const { mutate: writeApprove } = useApprove();
  const { mutate: writeBridge } = useBridge();

  const approve = useCallback(() => {
    if (!approveData) return;
    if (!approveData.isApprovalNeeded) return;
    writeApprove({ approveData });
  }, [approveData, writeApprove]);

  const bridge = useCallback(() => {
    if (!relayerFee) throw new Error("Relayer fee not ready");
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
    destinationDomain,
    originDomain,
    originTokenAddress,
    relayerFee,
    slippage,
    writeBridge,
  ]);

  return <p>WIP.</p>;
};

const useConnextSdk = () => {
  return useQuery({
    queryKey: [QueryKeys.ConnextSdk("init")],
    queryFn: async () => {
      const create = await import("@connext/sdk").then((mod) => mod.create);
      const sdk = await create(sdkConfig);
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
      const relayerFee = relayerFeeBN.toString();
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
  amount: string; // uint256 in string
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
          amount,
        );

      return {
        amountReceived: BigInt(amountReceived.toString()),
        routerFee: BigInt(routerFee.toString()),
      };
    },
    enabled: !!connextSdk,
  });
};

const useConnextApproval = ({
  originDomain,
  originTokenAddress,
  amount,
}: {
  originDomain: string;
  originTokenAddress: string;
  amount: string; // uint256 in string
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
        amount,
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
    enabled: !!connextSdk,
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
        amount,
        callData: "0x",
        relayerFee,
        // in BPS
        slippage: parseUnits(slippage, 2),
      };
      const xcallTxReq = await connextSdk.xcall(bridgeTxParams);
      const xcallTx = await signer.sendTransaction(xcallTxReq);
      toast.promise(
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
