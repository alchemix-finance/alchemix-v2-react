export const calculateMinimumOut = (
  amount: bigint | undefined,
  maximumLoss: bigint,
) => {
  if (!amount) return 0n;
  const pow = 10n ** 7n;
  return amount - (amount * maximumLoss) / pow;
};
