import { from, toString } from "dnum";

const subscriptMap: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
};

const subscriptDigit = (digit: number) => subscriptMap[digit];
const subscript = (num: number, formatter: Intl.NumberFormat) => {
  const transform = (part: Intl.NumberFormatPart) => {
    if (part.type !== "fraction") return part.value;
    return part.value.replace(/0+/, (match) => {
      return `0${subscriptDigit(match.length)}`;
    });
  };
  return formatter.formatToParts(num).map(transform).join("");
};

const getDisplayCurrency = (currency: string) => {
  if (!Intl.supportedValuesOf) return "symbol";
  if (Intl.supportedValuesOf("currency").includes(currency)) return "symbol";
  return "name";
};

export function formatNumber(
  amount: string | number | undefined | null,
  {
    decimals = 2,
    isCurrency = false,
  }: { decimals?: number; isCurrency?: boolean } = {},
) {
  if (amount !== undefined && amount !== null && !isNaN(+amount)) {
    const comparator = 1 / Math.pow(10, decimals);

    const intlOptions: Intl.NumberFormatOptions = {
      roundingMode: "trunc",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    };

    // Currency
    if (isCurrency) {
      const currency = "USD";
      intlOptions.style = "currency";
      intlOptions.currency = currency;
      intlOptions.currencyDisplay = getDisplayCurrency(currency);
      intlOptions.useGrouping = true;
    }

    // We use only en-US locale
    const locale = "en-US";

    if (+amount >= 1_000_000_000) {
      intlOptions.notation = "compact";
      const formatter = new Intl.NumberFormat(locale, intlOptions);
      return formatter.format(+amount);
    }

    const formatter = new Intl.NumberFormat(locale, intlOptions);

    // Small numbers
    if (+amount > 0 && +amount < comparator) {
      const lessThanComparatorRepresentation = `< ${comparator.toFixed(decimals)}`;

      const numStr = enforceToDecimalString(amount.toString());
      const match = numStr.match(/0\.0*(\d+)/);
      if (!match) return lessThanComparatorRepresentation;

      const digits = match[1];
      const numberOfZerosAfterDecimalPoint = numStr.slice(
        2,
        numStr.indexOf(digits),
      ).length;
      console.log(numberOfZerosAfterDecimalPoint, amount);
      if (numberOfZerosAfterDecimalPoint > 2) {
        // We need new formatter with more significant digits
        const formatter = new Intl.NumberFormat(locale, {
          ...intlOptions,
          maximumSignificantDigits: 5,
        });
        return subscript(+amount, formatter);
      } else return lessThanComparatorRepresentation;
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

const enforceToDecimalString = (value: string) => toString(from(value));

/** Format string number to look like a real number */
export const formatInput = (value: string) => {
  if (!value) return "";
  if (value === ".") return "0";
  if (value.endsWith("."))
    return enforceToDecimalString(value.replace(".", ""));
  return enforceToDecimalString(value);
};
