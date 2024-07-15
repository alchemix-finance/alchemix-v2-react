import { WaitForTransactionReceiptTimeoutError, stringToHex } from "viem";
import { it, expect } from "vitest";

it("Should pass if error is instance of WaitForTransactionReceiptTimeoutError", () => {
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
