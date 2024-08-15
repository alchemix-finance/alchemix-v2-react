import { from, toString, lessThan, equal, type Numberish } from "dnum";
import { parseUnits } from "viem";

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

const subscriptDigit = (digit: number) => {
  return digit
    .toString()
    .split("")
    .map((d) => subscriptMap[d])
    .join("");
};

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

const enforceToDecimalString = (value: Numberish) => toString(from(value));

interface BaseFormatNumberOptions {
  decimals?: number;
  isCurrency?: boolean;
  allowNegative?: boolean;
  dustToZero?: boolean;
  tokenDecimals?: number;
  compact?: boolean;
}

interface DustToZeroTrue extends BaseFormatNumberOptions {
  dustToZero: true;
  tokenDecimals: number;
}

interface DustToZeroFalse extends BaseFormatNumberOptions {
  dustToZero?: false;
  tokenDecimals?: never;
}

type FormatNumberOptions = DustToZeroTrue | DustToZeroFalse;

export function formatNumber(
  amount: string | number | undefined | null,
  {
    decimals = 2,
    isCurrency = false,
    allowNegative = true,
    dustToZero = false,
    tokenDecimals = 18,
    compact = false,
  }: FormatNumberOptions = {},
) {
  if (amount !== undefined && amount !== null && !!amount && !isNaN(+amount)) {
    // Negative numbers check
    if (!allowNegative && lessThan(amount, 0)) {
      return `${isCurrency ? "$" : ""}0.00`;
    }

    // Dust to zero check
    if (dustToZero) {
      try {
        const amountBigInt = parseUnits(
          enforceToDecimalString(amount),
          tokenDecimals,
        );
        if (lessThan(amountBigInt, 5n) || equal(amountBigInt, 5n)) {
          return `${isCurrency ? "$" : ""}0.00`;
        }
      } catch (e) {
        console.error("Error parsing units", e);
      }
    }

    const comparator = 1 / Math.pow(10, decimals);

    const intlOptions: Intl.NumberFormatOptions = {
      roundingMode: "trunc",
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    };

    if (compact) {
      intlOptions.notation = "compact";
    }

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

    const formatter = new Intl.NumberFormat(locale, intlOptions);

    // Small numbers
    if (+amount > 0 && +amount < comparator) {
      const lessThanComparatorRepresentation = `< ${isCurrency ? "$" : ""}${comparator.toFixed(decimals)}`;

      const numStr = enforceToDecimalString(amount);
      const match = numStr.match(/0\.0*(\d+)/);
      if (!match) return lessThanComparatorRepresentation;

      const digits = match[1];
      const numberOfZerosAfterDecimalPoint = numStr.slice(
        2,
        numStr.indexOf(digits),
      ).length;
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
    return `${isCurrency ? "$" : ""}0.00`;
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

/** Format string number to look like a real number */
export const formatInput = (value: string) => {
  if (!value) return "";
  if (value === ".") return "0";
  if (value.endsWith("."))
    return enforceToDecimalString(value.replace(".", ""));
  return enforceToDecimalString(value);
};
