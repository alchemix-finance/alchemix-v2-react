import {
  SupportedBridgeChainIds,
  useSubgraphDestinationData,
  useSubgraphOriginData,
} from "./lib/connext";

export const StatusBox = ({
  transactionHash,
  destinationChainId,
}: {
  transactionHash: `0x${string}` | undefined;
  destinationChainId: SupportedBridgeChainIds;
}) => {
  const { data: transferId, isFetching: isFetchingTransferId } =
    useSubgraphOriginData({ transactionHash });

  const { data: bridgeStatus, isFetching: isFetchingStatus } =
    useSubgraphDestinationData({
      transferId,
      destinationChainId,
    });

  let textContent = null;

  if (!!transactionHash && !transferId) {
    textContent =
      "Transaction has been submitted, awaiting Connext to pick it up.";
  }

  if (transferId && !bridgeStatus) {
    textContent = "Connext picked up transaction. Awaiting bridge status.";
  }

  if (bridgeStatus && bridgeStatus.status !== "Executed") {
    textContent = `Awaiting bridge. Current status: ${bridgeStatus.status}`;
  }

  if (bridgeStatus?.status === "Executed") {
    textContent = "Bridge is completed!";
  }

  const isFetching = isFetchingTransferId || isFetchingStatus;

  return (
    <div className="flex flex-col justify-center text-sm sm:items-end">
      <p>{isFetching ? "Updating..." : textContent}</p>
      {!!transactionHash && (
        <a
          href={`https://connextscan.io/tx/${transactionHash}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:no-underline"
        >
          Connext Explorer
        </a>
      )}
    </div>
  );
};
