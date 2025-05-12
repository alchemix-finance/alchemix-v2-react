import { useQuery } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { useEffect } from "react";
import { toast } from "sonner";

import { QueryKeys } from "@/lib/queries/queriesSchema";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { useChain } from "@/hooks/useChain";

const noticeShown: Record<`0x${string}`, boolean> = {};

export const SmartAccountNotice = () => {
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
    if (isSmartAccountUser && !noticeShown[address]) {
      noticeShown[address] = true;
      toast(
        <div className="space-y-2">
          <h1 className="font-semibold">
            We noticed you are using a smart account.
          </h1>
          <div className="space-y-1">
            <p>
              Alchemix does not support smart contract interaction unless
              whitelisted nor smart account interaction.
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
              . To use Alchemix with an EOA, you must disable smart account
              functionality.
            </p>
            <p>
              Subscribe to our{" "}
              <a
                href="https://x.com/AlchemixFi"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                X (Twitter)
              </a>{" "}
              for updates on Alchemix V3, which includes support for smart
              accounts!
            </p>
          </div>
        </div>,
        {
          dismissible: false,
          duration: 1000 * 120, // 2 minutes
        },
      );
    }
  }, [address, isSmartAccountUser]);

  return null;
};
