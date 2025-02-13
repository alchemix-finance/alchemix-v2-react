export const wormholeBridgeAdapterAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "srcChainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "tokenReceiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BridgedIn",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "dstChainId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "bridgeUser",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "tokenReceiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "BridgedOut",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint96",
        name: "oldGasLimit",
        type: "uint96",
      },
      {
        indexed: false,
        internalType: "uint96",
        name: "newGasLimit",
        type: "uint96",
      },
    ],
    name: "GasLimitUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint8", name: "version", type: "uint8" },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint16",
        name: "dstChainId",
        type: "uint16",
      },
      {
        indexed: true,
        internalType: "address",
        name: "target",
        type: "address",
      },
    ],
    name: "TargetAddressUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint16",
        name: "dstChainId",
        type: "uint16",
      },
      {
        indexed: true,
        internalType: "address",
        name: "tokenReceiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TokensSent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint16",
        name: "chainId",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "address",
        name: "addr",
        type: "address",
      },
      { indexed: false, internalType: "bool", name: "added", type: "bool" },
    ],
    name: "TrustedSenderUpdated",
    type: "event",
  },
  {
    inputs: [],
    name: "acceptOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint16", name: "chainId", type: "uint16" },
          { internalType: "address", name: "addr", type: "address" },
        ],
        internalType: "struct WormholeTrustedSender.TrustedSender[]",
        name: "_trustedSenders",
        type: "tuple[]",
      },
    ],
    name: "addTrustedSenders",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "addr", type: "address" }],
    name: "addressToBytes",
    outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint16", name: "chainId", type: "uint16" }],
    name: "allTrustedSenders",
    outputs: [{ internalType: "bytes32[]", name: "", type: "bytes32[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "dstChainId", type: "uint256" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "address", name: "to", type: "address" },
    ],
    name: "bridge",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint16", name: "dstChainId", type: "uint16" }],
    name: "bridgeCost",
    outputs: [{ internalType: "uint256", name: "gasCost", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "gasLimit",
    outputs: [{ internalType: "uint96", name: "", type: "uint96" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "newxerc20", type: "address" },
      { internalType: "address", name: "newOwner", type: "address" },
      {
        internalType: "address",
        name: "wormholeRelayerAddress",
        type: "address",
      },
      { internalType: "uint16", name: "targetChain", type: "uint16" },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint16", name: "chainId", type: "uint16" },
      { internalType: "address", name: "addr", type: "address" },
    ],
    name: "isTrustedSender",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint16", name: "chainId", type: "uint16" },
      { internalType: "bytes32", name: "addr", type: "bytes32" },
    ],
    name: "isTrustedSender",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
    name: "processedNonces",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "bytes", name: "payload", type: "bytes" },
      { internalType: "bytes[]", name: "", type: "bytes[]" },
      { internalType: "bytes32", name: "senderAddress", type: "bytes32" },
      { internalType: "uint16", name: "sourceChain", type: "uint16" },
      { internalType: "bytes32", name: "nonce", type: "bytes32" },
    ],
    name: "receiveWormholeMessages",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint16", name: "chainId", type: "uint16" },
          { internalType: "address", name: "addr", type: "address" },
        ],
        internalType: "struct WormholeTrustedSender.TrustedSender[]",
        name: "_trustedSenders",
        type: "tuple[]",
      },
    ],
    name: "removeTrustedSenders",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint96", name: "newGasLimit", type: "uint96" }],
    name: "setGasLimit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          { internalType: "uint16", name: "chainId", type: "uint16" },
          { internalType: "address", name: "addr", type: "address" },
        ],
        internalType: "struct WormholeTrustedSender.TrustedSender[]",
        name: "_chainConfig",
        type: "tuple[]",
      },
    ],
    name: "setTargetAddresses",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint16", name: "", type: "uint16" }],
    name: "targetAddress",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "wormholeRelayer",
    outputs: [
      { internalType: "contract IWormholeRelayer", name: "", type: "address" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "xERC20",
    outputs: [{ internalType: "contract IXERC20", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
