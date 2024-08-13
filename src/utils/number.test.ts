import { describe, expect, it } from "vitest";
import { formatInput, sanitizeNumber, formatNumber } from "./number";

describe("Format number", () => {
  describe("Common", () => {
    it("Should return 0.00 if amount is empty", () => {
      const amount = "";
      const formatted = formatNumber(amount);
      expect(formatted).toBe("0.00");
    });
    it("Should return 0.00 if amount is 0", () => {
      const amount = "0";
      const formatted = formatNumber(amount);
      expect(formatted).toBe("0.00");
    });
    it("Should return 0.00 if amount is not a number", () => {
      const amount = "not a number";
      const formatted = formatNumber(amount);
      expect(formatted).toBe("0.00");
    });
    it("Should return 0.00 if amount is undefined", () => {
      const amount = undefined;
      const formatted = formatNumber(amount);
      expect(formatted).toBe("0.00");
    });
    it("Should return 0.00 if amount is null", () => {
      const amount = null;
      const formatted = formatNumber(amount);
      expect(formatted).toBe("0.00");
    });
  });

  describe("Negative numbers disabled", () => {
    it('Should return "0.00" if amount is -1', () => {
      const amount = "-1";
      const formatted = formatNumber(amount, { allowNegative: false });
      expect(formatted).toBe("0.00");
    });
    it('Should return "$0.00" if amount is -1 and isCurrency is true', () => {
      const amount = "-1";
      const formatted = formatNumber(amount, {
        allowNegative: false,
        isCurrency: true,
      });
      expect(formatted).toBe("$0.00");
    });
  });

  describe("Small numbers", () => {
    it('Should return "0.0₅1" for amount 0.000001', () => {
      expect(formatNumber(0.000001)).toEqual("0.0₅1");
    });
    it('Should return "0.0₆12345" for amount 0.000000123456', () => {
      expect(formatNumber(0.000000123456)).toEqual("0.0₆12345");
    });
    it('Should return "0.0₁₄1" for amount 0.000000000000001', () => {
      expect(formatNumber(0.000000000000001)).toEqual("0.0₁₄1");
    });
    it('Should return less than comparator representation "< 0.01" for amount 0.001', () => {
      expect(formatNumber(0.001)).toEqual("< 0.01");
    });
    it('Should return less than comparator representation "< 0.01" for amount 0.009', () => {
      expect(formatNumber(0.009)).toEqual("< 0.01");
    });
    it("Should return 0.01 for amount 0.01", () => {
      expect(formatNumber(0.01)).toEqual("0.01");
    });
    it("Shoult return subscript for amount 0.0009", () => {
      expect(formatNumber(0.0009)).toEqual("0.0₃9");
    });
  });

  describe("Compact notation", () => {
    it("Should use compact notation if it is greater than 1_000_000_000", () => {
      const amount = "1000000000";
      const formatted = formatNumber(amount);
      expect(formatted).toBe("1.00B");
    });
  });

  describe("Currency", () => {
    it("Should format number with currency symbol", () => {
      const amount = "1000";
      const formatted = formatNumber(amount, { isCurrency: true });
      expect(formatted).toBe("$1,000.00");
    });
  });

  describe("Decimals", () => {
    it("Should format number with 4 decimals", () => {
      const amount = "1000";
      const formatted = formatNumber(amount, { decimals: 4 });
      expect(formatted).toBe("1,000.0000");
    });
  });
});

describe("Sanitize input", () => {
  it("Should sanitize input if precision is more than decimals", () => {
    const decimals = 19;
    const input = "1." + "1".repeat(decimals - 1);
    const sanitized = sanitizeNumber(input, decimals);
    expect(sanitized.length).toBe(20);
  });
});

describe("Format input", () => {
  it("Should format input if fraction point is redundant", () => {
    const input = "1.0";
    const formatted = formatInput(input);
    expect(formatted).toBe("1");
  });
  it("Should format input if fraction point omits leading zero", () => {
    const input = ".1";
    const formatted = formatInput(input);
    expect(formatted).toBe("0.1");
  });
  it("Should format input if fraction point omits decimal zeros", () => {
    const input = "1.";
    const formatted = formatInput(input);
    expect(formatted).toBe("1");
  });
  it("Should not format input if input is empty", () => {
    const input = "";
    const formatted = formatInput(input);
    expect(formatted).toBe("");
  });
  it("Should return 0 if input is a fraction point", () => {
    const input = ".";
    const formatted = formatInput(input);
    expect(formatted).toBe("0");
  });
});
