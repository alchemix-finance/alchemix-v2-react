import { Token } from "@/lib/types";

interface LocalStorageSchema {
  tokenListCache: { tokens: Token[]; timestamp: number };
}

const localStorageVersion = "v1";

export const lsService = {
  getItem: <K extends keyof LocalStorageSchema>(
    chainId: number,
    key: K,
  ): LocalStorageSchema[K] | undefined => {
    const value = localStorage.getItem(
      `${chainId}-${key}-${localStorageVersion}`,
    );
    if (!value) {
      return;
    }
    const parsedValue = JSON.parse(value);
    return parsedValue;
  },
  setItem: <K extends keyof LocalStorageSchema>(
    chainId: number,
    key: K,
    value: LocalStorageSchema[K],
  ) => {
    const stringValue = JSON.stringify(value);
    localStorage.setItem(
      `${chainId}-${key}-${localStorageVersion}`,
      stringValue,
    );
  },
};
