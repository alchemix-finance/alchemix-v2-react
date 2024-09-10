import {
  bridgeChains,
  chainIdToDomainMapping,
  chainToAvailableTokensMapping,
  SupportedBridgeChainIds,
  targetMapping,
} from "./connext";

export const getIsConnectedChainNotSupportedForBridge = (chainId: number) => {
  return !bridgeChains.some((c) => c.id === chainId);
};

export const getOriginDomain = (chainId: number) => {
  return getIsConnectedChainNotSupportedForBridge(chainId)
    ? chainIdToDomainMapping[bridgeChains[0].id]
    : chainIdToDomainMapping[chainId as SupportedBridgeChainIds];
};

export const getInitialOriginTokenAddresses = (chainId: number) => {
  return getIsConnectedChainNotSupportedForBridge(chainId)
    ? chainToAvailableTokensMapping[bridgeChains[0].id]
    : chainToAvailableTokensMapping[chainId as SupportedBridgeChainIds];
};

export const getSpender = ({ originChainId }: { originChainId: number }) => {
  return getIsConnectedChainNotSupportedForBridge(originChainId)
    ? targetMapping[bridgeChains[0].id]
    : targetMapping[originChainId as SupportedBridgeChainIds];
};
