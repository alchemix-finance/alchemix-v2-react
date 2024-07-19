import { Token } from "@/lib/types";

//-- ATTENTION --//
// Keys are not to be removed or changed without setting a proper clean-up and migration logic in place.
// Same for the versioning of the localStorage.
//-- ATTENTION --//

interface LocalStorageSchema {
  tokenListCache: { tokens: Token[]; timestamp: number };
  tenderlyForkRpc: string;
  tenderlyForkChainId: number;
}

const localStorageVersion = "v1";

/**
 * LocalStorage service to get and set items in localStorage
 * in typesafe way.
 * @dev uses JSON.parse and JSON.stringify to store and retrieve items
 * @dev Set chain id to 0 for not chain specific items
 */
export const lsService = {
  /**
   * Type safe getItem from localStorage
   * @dev Set chain id to 0 for not chain specific items
   * @param chainId Chain id that you want item to be applied to
   * @param key One of the keys in LocalStorageSchema
   * @returns Parsed value from localStorage
   */
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

  /**
   * Type safe setItem to localStorage
   * @dev Set chain id to 0 for not chain specific items
   * @param chainId Chain id that you want item to be applied to
   * @param key One of the keys in LocalStorageSchema
   * @param value Value to be set
   */
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

  /**
   * Type safe removeItem from localStorage
   * @dev Set chain id to 0 for not chain specific items
   * @param chainId Chain id that you want item to be applied to
   * @param key One of the keys in LocalStorageSchema
   */
  removeItem: <K extends keyof LocalStorageSchema>(chainId: number, key: K) => {
    localStorage.removeItem(`${chainId}-${key}-${localStorageVersion}`);
  },
};
