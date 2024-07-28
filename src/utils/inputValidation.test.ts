import { decimalNumberValidationRegex } from "./inputValidation";
import { describe, it, expect } from "vitest";

describe("Decimal number validation Regex", () => {
  const regex = new RegExp(decimalNumberValidationRegex);

  it("Should pass if input is decimal input", () => {
    const input = "0.1";
    expect(regex.test(input)).toBeTruthy();
  });
  it("Should fail if input is not decimal input", () => {
    const input = "abc";
    expect(regex.test(input)).toBeFalsy();
  });
  it("Should pass if input omits first zero", () => {
    const input = ".1";
    expect(regex.test(input)).toBeTruthy();
  });
  it("Should pass if input omits the decimal part", () => {
    const input = "1.";
    expect(regex.test(input)).toBeTruthy();
  });
});
