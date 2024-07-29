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

/** Enforce precision on a string number */
export const sanitizeNumber = (input: string, precision?: number) => {
  const sanitized = input
    .replace(/,/, ".")
    .replace(/[^\d.]/g, "")
    .replace(/\./, "x")
    .replace(/\./g, "")
    .replace(/x/, ".");
  if (!precision) return sanitized;
  const [integer, decimals] = sanitized.split(".");
  if (decimals) return `${integer}.${decimals.substring(0, precision)}`;
  else return sanitized;
};

/** Format input number */
export const formatInput = (input: string) => {
  if (!input) return "";
  if (input === ".") return "0";
  // NOTE: Input matches pattern, so we don't expect it to be NaN
  return parseFloat(input).toString();
};
