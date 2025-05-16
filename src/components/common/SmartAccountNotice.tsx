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

  const { data: smartAccountData } = useQuery({
    queryKey: [QueryKeys.SmartAccountUser, publicClient, address],
    queryFn: async () => {
      const code = await publicClient.getCode({ address });

      const isSmartAccountUser = !!code;
      const isEip7702User = !!code && code.startsWith("0xef0100");

      return { isSmartAccountUser, isEip7702User };
    },
  });

  useEffect(() => {
    const { isSmartAccountUser, isEip7702User } = smartAccountData ?? {};
    if (isSmartAccountUser && !toastId.current) {
      toastId.current = toast(
        <div className="space-y-2">
          <h1 className="font-semibold">
            We noticed you are using a{" "}
            {isEip7702User ? "Smart Acount." : "Smart Contract."}
          </h1>
          <div className="space-y-1">
            <p>
              Alchemix does not support{" "}
              {isEip7702User
                ? "Smart Acount interaction."
                : "Smart Contract interaction unless whitelisted."}
            </p>
            <p>
              {isEip7702User ? (
                "To use Alchemix with a standard EOA, you must disable smart account functionality."
              ) : (
                <>
                  To get your smart contract whitelisted, reach out in{" "}
                  <a
                    href="http://discord.com/invite/alchemix"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Discord
                  </a>
                  .
                </>
              )}
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
  }, [smartAccountData]);

  return null;
};
