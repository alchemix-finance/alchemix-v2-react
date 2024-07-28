import { describe, expect, it } from "vitest";
import { sanitizeNumber } from "./number";

describe("Sanitize input test", () => {
  it("Should sanitize input if precision is more than decimals", () => {
    const decimals = 19;
    const input = "1." + "1".repeat(decimals - 1);
    const sanitized = sanitizeNumber(input, decimals);
    expect(sanitized.length).toBe(20);
  });
});
