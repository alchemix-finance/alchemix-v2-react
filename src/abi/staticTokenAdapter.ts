import { parseAbi } from "viem";

export const staticTokenAdapterAbi = parseAbi([
  "function staticToDynamicAmount(uint256 amount) external view returns (uint256 dynamicAmount)",
  "function dynamicToStaticAmount(uint256 amount) external view returns (uint256 staticAmount)",
]);
