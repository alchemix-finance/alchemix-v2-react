export function formatNumber(
  amount: string | number | undefined | null,
  decimals = 2,
) {
  if (amount !== undefined && amount !== null && !isNaN(+amount)) {
    const comparator = 1 / Math.pow(10, decimals);

    if (+amount > 0 && +amount < comparator) {
      return `< ${comparator.toFixed(decimals)}`;
    }

    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    if (+amount >= 1_000_000_000) {
      return formatter.format(+amount / 1_000_000_000) + "b";
    }

    return formatter.format(+amount);
  } else {
    return "0.00";
  }
}
