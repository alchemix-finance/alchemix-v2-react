export const StatusBox = ({
  transactionHash,
}: {
  transactionHash: `0x${string}` | undefined;
}) => {
  return transactionHash ? (
    <div className="flex flex-col justify-center text-sm sm:items-end">
      <p>Transaction has been submitted, check Connext Explorer for status.</p>
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
  ) : null;
};
