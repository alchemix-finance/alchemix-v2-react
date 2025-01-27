import { type ExternalToast, toast } from "sonner";
import {
  AbiErrorSignatureNotFoundError,
  ContractFunctionRevertedError,
  SimulateContractErrorType,
  decodeErrorResult,
} from "viem";

import { alchemistErrorsAbi } from "@/abi/alchemistErrors";

export const ctaErrorToast = (
  message: React.ReactNode,
  data: ExternalToast & { error: SimulateContractErrorType },
) => {
  const error = data.error;
  if (error) {
    const errorMessage = (() => {
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
    })();

    toast.error(message, {
      ...data,
      description: errorMessage,
    });

    return;
  }
  toast.error(message, data);
};
