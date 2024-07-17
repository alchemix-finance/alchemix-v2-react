import { Input } from "../ui/input";
import { isAddress, stringToHex, zeroAddress } from "viem";
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
import { mutationCallback } from "@/utils/helpers/mutationCallback";

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
    mutation: mutationCallback({
      action: "Delegate voting power",
      addRecentTransaction,
      publicClient,
    }),
  });

  const { data: revokeConfig, error: revokeConfigError } = useSimulateContract({
    address: DELEGATE_REGISTRY_ADDRESS,
    abi: delegateRegistryAbi,
    functionName: "clearDelegate",
    args: [stringToHex("alchemixstakers.eth", { size: 32 })],
  });

  const { writeContract: revoke } = useWriteContract({
    mutation: mutationCallback({
      action: "Revoke delegation",
      addRecentTransaction,
      publicClient,
    }),
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
