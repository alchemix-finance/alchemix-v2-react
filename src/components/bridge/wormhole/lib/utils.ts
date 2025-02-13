import {
  bridgeChains,
  chainIdToWormholeChainIdMapping,
  chainToAvailableTokensMapping,
  SupportedBridgeChainIds,
  targetMapping,
} from "./wormhole";

export const getIsConnectedChainNotSupportedForBridge = (chainId: number) => {
  return !bridgeChains.some((c) => c.id === chainId);
};

export const getInitialOriginTokenAddresses = (chainId: number) => {
  return getIsConnectedChainNotSupportedForBridge(chainId)
    ? chainToAvailableTokensMapping[bridgeChains[0].id]
    : chainToAvailableTokensMapping[chainId as SupportedBridgeChainIds];
};

export const getSpender = ({
  originChainId,
  originTokenAddress,
}: {
  originChainId: number;
  originTokenAddress: `0x${string}`;
}) => {
  if (getIsConnectedChainNotSupportedForBridge(originChainId)) {
    return targetMapping[bridgeChains[0].id][originTokenAddress];
  }

  return targetMapping[originChainId as SupportedBridgeChainIds][
    originTokenAddress
  ];
};

export const getDestinationWormholeChainId = (chainId: number) => {
  return getIsConnectedChainNotSupportedForBridge(chainId)
    ? chainIdToWormholeChainIdMapping[bridgeChains[0].id]
    : chainIdToWormholeChainIdMapping[chainId as SupportedBridgeChainIds];
};
