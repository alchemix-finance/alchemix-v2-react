export const alchemistErrorsAbi = [
  {
    type: "error",
    name: "ExpectedValueExceeded",
    inputs: [
      { name: "yieldToken", type: "address", internalType: "address" },
      { name: "expectedValue", type: "uint256", internalType: "uint256" },
      {
        name: "maximumExpectedValue",
        type: "uint256",
        internalType: "uint256",
      },
    ],
  },
  {
    type: "error",
    name: "LiquidationLimitExceeded",
    inputs: [
      { name: "underlyingToken", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "available", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "LossExceeded",
    inputs: [
      { name: "yieldToken", type: "address", internalType: "address" },
      { name: "loss", type: "uint256", internalType: "uint256" },
      { name: "maximumLoss", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "MintingLimitExceeded",
    inputs: [
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "available", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "RepayLimitExceeded",
    inputs: [
      { name: "underlyingToken", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "available", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "SlippageExceeded",
    inputs: [
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "minimumAmountOut", type: "uint256", internalType: "uint256" },
    ],
  },
  {
    type: "error",
    name: "TokenDisabled",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
  { type: "error", name: "Undercollateralized", inputs: [] },
  {
    type: "error",
    name: "UnsupportedToken",
    inputs: [{ name: "token", type: "address", internalType: "address" }],
  },
] as const;
