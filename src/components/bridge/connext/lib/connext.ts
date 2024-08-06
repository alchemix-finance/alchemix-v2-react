import { useAccount } from "wagmi";
import { toast } from "sonner";
import { formatEther, parseEther, parseUnits } from "viem";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { SdkConfig } from "@connext/sdk";

import { QueryKeys } from "@/lib/queries/queriesSchema";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { isInputZero } from "@/utils/inputNotZero";

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

export const useConnextSdk = () => {
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

export const useConnextRelayerFee = ({
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

export const useConnextAmountOut = ({
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

export const useConnextApproval = ({
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

export const useConnextWriteApprove = () => {
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

export const useConnextWriteBridge = () => {
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
