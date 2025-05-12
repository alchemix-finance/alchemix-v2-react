import { useQuery } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { QueryKeys } from "@/lib/queries/queriesSchema";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { useChain } from "@/hooks/useChain";

export const SmartAccountNotice = () => {
  const toastId = useRef<string | number | null>(null);

  const chain = useChain();
  const publicClient = usePublicClient<typeof wagmiConfig>({
    chainId: chain.id,
  });
  const { address = zeroAddress } = useAccount();

  const { data: isSmartAccountUser } = useQuery({
    queryKey: [QueryKeys.SmartAccountUser, publicClient, address],
    queryFn: async () => {
      const code = await publicClient.getCode({ address });
      // viem returns undefined if the address is not a contract
      return !!code;
    },
  });

  useEffect(() => {
    if (isSmartAccountUser && !toastId.current) {
      toastId.current = toast(
        <div className="space-y-2">
          <h1 className="font-semibold">
            We noticed you are using a smart account.
          </h1>
          <div className="space-y-1">
            <p>
              Alchemix does not support Smart Contract or Smart Account
              interaction unless whitelisted.
            </p>
            <p>
              To get your smart contract whitelisted, reach out in{" "}
              <a
                href="http://discord.com/invite/alchemix"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Discord
              </a>
              . To use Alchemix with a standard EOA, you must disable smart
              account functionality.
            </p>
            <p>
              Subscribe to our{" "}
              <a
                href="https://x.com/AlchemixFi"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                X (@AlchemixFi)
              </a>{" "}
              for updates on Alchemix v3, which includes support for Smart
              Accounts!
            </p>
          </div>
        </div>,
        {
          dismissible: false,
          duration: 1000 * 120, // 2 minutes
        },
      );
    }
    if (!isSmartAccountUser && toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }
    return () => {
      if (toastId.current) {
        toast.dismiss(toastId.current);
        toastId.current = null;
      }
    };
  }, [isSmartAccountUser]);

  return null;
};
