export const tokenizedStrategyAbi =
[
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_factory",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "Approval",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "caller",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "assets",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "Deposit",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "strategy",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "asset",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "string",
                "name": "apiVersion",
                "type": "string",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "NewTokenizedStrategy",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "profit",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "loss",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "protocolFees",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "performanceFees",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "Reported",
        "anonymous": false
    },
    {
        "inputs": [],
        "type": "event",
        "name": "StrategyShutdown",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "Transfer",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newEmergencyAdmin",
                "type": "address",
                "indexed": true
            }
        ],
        "type": "event",
        "name": "UpdateEmergencyAdmin",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newKeeper",
                "type": "address",
                "indexed": true
            }
        ],
        "type": "event",
        "name": "UpdateKeeper",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newManagement",
                "type": "address",
                "indexed": true
            }
        ],
        "type": "event",
        "name": "UpdateManagement",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newPendingManagement",
                "type": "address",
                "indexed": true
            }
        ],
        "type": "event",
        "name": "UpdatePendingManagement",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "newPerformanceFee",
                "type": "uint16",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "UpdatePerformanceFee",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newPerformanceFeeRecipient",
                "type": "address",
                "indexed": true
            }
        ],
        "type": "event",
        "name": "UpdatePerformanceFeeRecipient",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "newProfitMaxUnlockTime",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "UpdateProfitMaxUnlockTime",
        "anonymous": false
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "caller",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address",
                "indexed": true
            },
            {
                "internalType": "uint256",
                "name": "assets",
                "type": "uint256",
                "indexed": false
            },
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256",
                "indexed": false
            }
        ],
        "type": "event",
        "name": "Withdraw",
        "anonymous": false
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "DOMAIN_SEPARATOR",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "FACTORY",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "MAX_FEE",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "acceptManagement"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "pure",
        "type": "function",
        "name": "apiVersion",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "asset",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "convertToAssets",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "assets",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "convertToShares",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "assets",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "deposit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "emergencyAdmin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "emergencyWithdraw"
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "fullProfitUnlockDate",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_asset",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_name",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "_management",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_performanceFeeRecipient",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_keeper",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "initialize"
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "isShutdown",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "keeper",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "lastReport",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "management",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "maxDeposit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "maxMint",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "maxRedeem",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "maxWithdraw",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "mint",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "assets",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "nonces",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "pendingManagement",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "performanceFee",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "performanceFeeRecipient",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "deadline",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "v",
                "type": "uint8"
            },
            {
                "internalType": "bytes32",
                "name": "r",
                "type": "bytes32"
            },
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "permit"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "assets",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "previewDeposit",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "previewMint",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "previewRedeem",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "assets",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "previewWithdraw",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "pricePerShare",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "profitMaxUnlockTime",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "profitUnlockingRate",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "maxLoss",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "redeem",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "redeem",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "report",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "profit",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "loss",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_sender",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "requireEmergencyAuthorized"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_sender",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "requireKeeperOrManagement"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_sender",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function",
        "name": "requireManagement"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_emergencyAdmin",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setEmergencyAdmin"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_keeper",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setKeeper"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_management",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setPendingManagement"
    },
    {
        "inputs": [
            {
                "internalType": "uint16",
                "name": "_performanceFee",
                "type": "uint16"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setPerformanceFee"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_performanceFeeRecipient",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setPerformanceFeeRecipient"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_profitMaxUnlockTime",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "setProfitMaxUnlockTime"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "shutdownStrategy"
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "tend"
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "totalAssets",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ]
    },
    {
        "inputs": [],
        "stateMutability": "view",
        "type": "function",
        "name": "unlockedShares",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "assets",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "maxLoss",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            }
        ]
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "assets",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "receiver",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function",
        "name": "withdraw",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "shares",
                "type": "uint256"
            }
        ]
    }
]
