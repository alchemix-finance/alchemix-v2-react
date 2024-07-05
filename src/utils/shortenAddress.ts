import { isAddress } from "viem";

export const shortenAddress = (address: string) => {
  if (!address) return "";
  if (!isAddress(address)) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};
