type BridgeProvider = "connext" | "wormhole";

const EXPLORERS_MAPPING = {
  connext: "https://connextscan.io/tx",
  wormhole: "https://wormholescan.io/#/tx",
} as const satisfies Record<BridgeProvider, string>;

export const StatusBox = ({
  transactionHash,
  bridgeProvider,
}: {
  transactionHash: `0x${string}` | undefined;
  bridgeProvider: BridgeProvider;
}) => {
  return transactionHash ? (
    <div className="flex flex-col justify-center text-sm sm:items-end">
      <p>
        Transaction has been submitted, check{" "}
        <span className="capitalize">{bridgeProvider}</span> Explorer for
        status.
      </p>
      {!!transactionHash && (
        <a
          href={`${EXPLORERS_MAPPING[bridgeProvider]}/${transactionHash}`}
          target="_blank"
          rel="noreferrer"
          className="capitalize underline hover:no-underline"
        >
          {bridgeProvider} Explorer
        </a>
      )}
    </div>
  ) : null;
};
