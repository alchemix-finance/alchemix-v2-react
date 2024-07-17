import { Input } from "../ui/input";
import {
  WaitForTransactionReceiptTimeoutError,
  isAddress,
  stringToHex,
  zeroAddress,
} from "viem";
import { shortenAddress } from "@/utils/shortenAddress";
import { usePublicClient, useSimulateContract, useWriteContract } from "wagmi";
import { delegateRegistryAbi } from "@/abi/delegateRegistry";
import { DELEGATE_REGISTRY_ADDRESS } from "@/lib/constants";
import { useCallback, useState } from "react";
import { useUserDelegations } from "@/lib/queries/useProposals";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useChain } from "@/hooks/useChain";
import { wagmiConfig } from "../providers/Web3Provider";
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit";

export const Delegation = () => {
  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const addRecentTransaction = useAddRecentTransaction();

  const [delegateAddress, setDelegateAddress] = useState("");

  const { data: userDelegations } = useUserDelegations();

  const { data: delegateConfig, error: delegateConfigError } =
    useSimulateContract({
      address: DELEGATE_REGISTRY_ADDRESS,
      abi: delegateRegistryAbi,
      functionName: "setDelegate",
      args: [
        stringToHex("alchemixstakers.eth", { size: 32 }),
        isAddress(delegateAddress) ? delegateAddress : zeroAddress,
      ],
      query: {
        enabled: isAddress(delegateAddress),
      },
    });

  const { writeContract: delegate } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        addRecentTransaction({
          hash,
          description: "Delegate voting power",
        });
        const miningPromise = publicClient.waitForTransactionReceipt({
          hash,
        });
        toast.promise(miningPromise, {
          loading: "Delegating...",
          success: "Delegation confirmed",
          error: (e) => {
            return e instanceof WaitForTransactionReceiptTimeoutError
              ? "We could not confirm your delegation. Please check your wallet."
              : "Delegation failed";
          },
        });
      },
      onError: (error) => {
        toast.error("Delegation failed", {
          description: error.message,
        });
      },
    },
  });

  const { data: revokeConfig, error: revokeConfigError } = useSimulateContract({
    address: DELEGATE_REGISTRY_ADDRESS,
    abi: delegateRegistryAbi,
    functionName: "clearDelegate",
    args: [stringToHex("alchemixstakers.eth", { size: 32 })],
  });

  const { writeContract: revoke } = useWriteContract({
    mutation: {
      onSuccess: (hash) => {
        addRecentTransaction({
          hash,
          description: "Revoke delegation",
        });
        const miningPromise = publicClient.waitForTransactionReceipt({
          hash,
        });
        toast.promise(miningPromise, {
          loading: "Revoking...",
          success: "Revoke confirmed",
          error: (e) => {
            return e instanceof WaitForTransactionReceiptTimeoutError
              ? "We could not confirm your revoke. Please check your wallet."
              : "Revoke failed";
          },
        });
      },
      onError: (error) => {
        toast.error("Revoke failed", {
          description: error.message,
        });
      },
    },
  });

  const onDelegateClick = useCallback(() => {
    if (delegateConfigError) {
      toast.error("Error delegating voting power", {
        description:
          delegateConfigError.name === "ContractFunctionExecutionError"
            ? delegateConfigError.cause.message
            : delegateConfigError.message,
      });
      return;
    }
    if (delegateConfig) {
      delegate(delegateConfig.request);
    } else {
      toast.error(
        "Error delegating voting power. Unexpected error. Please contact Alchemix team.",
      );
    }
  }, [delegate, delegateConfig, delegateConfigError]);

  const onRevokeClick = useCallback(() => {
    if (revokeConfigError) {
      toast.error("Error revoking delegation", {
        description:
          revokeConfigError.name === "ContractFunctionExecutionError"
            ? revokeConfigError.cause.message
            : revokeConfigError.message,
      });
      return;
    }
    if (revokeConfig) {
      revoke(revokeConfig.request);
    } else {
      toast.error(
        "Error revoking delegation. Unexpected error. Please contact Alchemix team.",
      );
    }
  }, [revoke, revokeConfig, revokeConfigError]);

  return (
    <div className="m-4 flex flex-row space-x-4">
      <div className="flex w-full flex-col space-y-4">
        <p>Delegate your voting power:</p>
        <Input
          value={delegateAddress}
          onChange={(e) => setDelegateAddress(e.target.value)}
          type="text"
          placeholder="0x..."
        />
        <Button
          disabled={!isAddress(delegateAddress)}
          onClick={onDelegateClick}
        >
          Delegate
        </Button>
      </div>
      {userDelegations && userDelegations.delegating.length > 0 && (
        <div className="flex w-full flex-col space-y-4">
          <p>My Delegations:</p>
          <div className="flex w-full flex-col space-y-4">
            {userDelegations?.delegating.map(({ delegate }) => (
              <div
                key={delegate}
                className="flex w-full flex-row space-x-2 rounded border border-grey3inverse bg-grey10inverse p-2"
              >
                <p>{shortenAddress(delegate)}</p>
              </div>
            ))}
            <Button onClick={onRevokeClick}>Revoke</Button>
          </div>
        </div>
      )}
      {userDelegations && userDelegations.delegations.length > 0 && (
        <div className="flex w-full flex-col space-y-4">
          <p>Delegated to me:</p>
          <div className="flex w-full flex-col space-y-2">
            {userDelegations?.delegations.map(({ delegator }) => (
              <div
                key={delegator}
                className="flex w-full flex-row space-x-2 rounded border border-grey3inverse bg-grey10inverse p-2"
              >
                <p>{shortenAddress(delegator)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
