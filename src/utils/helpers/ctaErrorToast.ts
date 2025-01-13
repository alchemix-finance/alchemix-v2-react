import { type ExternalToast, toast } from "sonner";
import {
  AbiErrorSignatureNotFoundError,
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
        if (noSignatureError instanceof AbiErrorSignatureNotFoundError) {
          try {
            const decodedError = decodeErrorResult({
              abi: alchemistErrorsAbi,
              data: noSignatureError.signature,
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
