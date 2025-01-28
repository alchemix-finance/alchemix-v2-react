import {
  AbiErrorSignatureNotFoundError,
  ContractFunctionRevertedError,
  decodeErrorResult,
} from "viem";
import { SimulateContractErrorType } from "@wagmi/core";

import { alchemistErrorsAbi } from "@/abi/alchemistErrors";

/**
 * Get the error message to be displayed in the toast's description.
 *
 * If the error is a contract function execution error, we want to display the error cause message.
 *
 * If the error couldn't be decoded, we try to decode raw revert data manually against `AlchemistErrors` ABI.
 *
 * Otherwise, we return the error message.
 *
 * @param {Object} args - The args object.
 * @param {SimulateContractErrorType} args.error - The error returned from `useSimulateContract` hook.
 */
export const getToastErrorMessage = ({
  error,
}: {
  error: SimulateContractErrorType;
}) => {
  if (error.name === "ContractFunctionExecutionError") {
    const noSignatureError = error.walk(
      (err) => err instanceof AbiErrorSignatureNotFoundError,
    );
    const dataError = error.walk(
      (err) => err instanceof ContractFunctionRevertedError,
    );
    if (
      noSignatureError instanceof AbiErrorSignatureNotFoundError &&
      dataError instanceof ContractFunctionRevertedError &&
      dataError.raw
    ) {
      try {
        const decodedError = decodeErrorResult({
          abi: alchemistErrorsAbi,
          data: dataError.raw,
        });
        return decodedError.errorName;
      } catch (e) {
        /* Do nothing */
      }
    }

    return error.cause.message;
  }
  return error.message;
};
