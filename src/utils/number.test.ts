import { describe, expect, it } from "vitest";
import { formatInput, sanitizeNumber } from "./number";

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
