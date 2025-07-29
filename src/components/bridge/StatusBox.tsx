import { useQuery } from "@tanstack/react-query";

import { QueryKeys } from "@/lib/queries/queriesSchema";

interface LayerZeroMessage {
  data: [
    {
      status: {
        name:
          | "INFLIGHT"
          | "CONFIRMING"
          | "FAILED"
          | "DELIVERED"
          | "BLOCKED"
          | "PAYLOAD_STORED"
          | "APPLICATION_BURNED"
          | "APPLICATION_SKIPPED"
          | "UNRESOLVABLE_COMMAND"
          | "MALFORMED_COMMAND";
        message: string;
      };
      // .. omitted other properties for brevity
    },
  ];
}

export const StatusBox = ({
  transactionHash,
}: {
  transactionHash: `0x${string}` | undefined;
}) => {
  const { data: bridgeStatus } = useQuery({
    queryKey: [QueryKeys.BridgeStatus, transactionHash],
    queryFn: async () => {
      if (!transactionHash) {
        throw new Error("Transaction hash is required");
      }

      const response = await fetch(
        `https://scan.layerzero-api.com/v1/messages/tx/${transactionHash}`,
      );

      if (response.status === 404) {
        throw new Error("Transaction not found");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch transaction status");
      }

      const data = (await response.json()) as LayerZeroMessage;

      return data.data[0].status.name;
    },
    enabled: !!transactionHash,
    placeholderData: "INFLIGHT",
    refetchInterval: (data) => {
      // Refetch every 10 seconds if the status is still INFLIGHT or CONFIRMING
      return data.state.data !== "DELIVERED" ? 10000 : false;
    },
    retry: (failureCount, error) => {
      if (error.message.includes("Transaction not found")) return true;
      return failureCount < 3;
    },
  });

  return transactionHash ? (
    <div className="flex flex-col justify-center text-sm">
      <p>
        Transaction has been submitted. Current status:{" "}
        <span aria-live="polite" className="font-medium">
          {bridgeStatus}
        </span>
      </p>
      <a
        href={`https://layerzeroscan.com/tx/${transactionHash}`}
        target="_blank"
        rel="noreferrer"
        className="underline hover:no-underline"
      >
        LayerZero Explorer
      </a>
    </div>
  ) : null;
};
