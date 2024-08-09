import {
  TransactionNotFoundError,
  WaitForTransactionReceiptTimeoutError,
  stringToHex,
} from "viem";
import { describe, it, expect } from "vitest";

describe("mutationCallback", () => {
  it("Error is instance of WaitForTransactionReceiptTimeoutError", () => {
    const mockHash = stringToHex("");
    const thrownErrorInCallback = new WaitForTransactionReceiptTimeoutError({
      hash: mockHash,
    });

    expect(thrownErrorInCallback).toBeInstanceOf(
      WaitForTransactionReceiptTimeoutError,
    );

    const isInstanceOf =
      thrownErrorInCallback instanceof WaitForTransactionReceiptTimeoutError;

    expect(isInstanceOf).toBe(true);
  });

  it("Error is instance of TransactionNotFoundError", () => {
    const mockHash = stringToHex("");
    const thrownErrorInCallback = new TransactionNotFoundError({
      hash: mockHash,
    });

    expect(thrownErrorInCallback).toBeInstanceOf(TransactionNotFoundError);

    const isInstanceOf =
      thrownErrorInCallback instanceof TransactionNotFoundError;

    expect(isInstanceOf).toBe(true);
  });

  it("Error is not instance of TransactionNotFoundError", () => {
    const thrownErrorInCallback = new Error("Some other error");

    expect(thrownErrorInCallback).not.toBeInstanceOf(TransactionNotFoundError);

    const isInstanceOf =
      thrownErrorInCallback instanceof TransactionNotFoundError;

    expect(isInstanceOf).toBe(false);
  });
});
