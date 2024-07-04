import { alchemistV2Abi } from "@/abi/alchemistV2";
import { Vault } from "@/lib/types";
import { UsePublicClientReturnType } from "wagmi";

export class VaultHelper {
  vault;

  constructor(vault: Vault) {
    this.vault = vault;
  }

  convertYieldTokensToShares(amount: bigint) {
    const totalShares = this.vault.yieldTokenParams.totalShares;

    if (totalShares === 0n) return amount;

    return (amount * totalShares) / this.calculateUnrealizedActiveBalance();
  }

  convertSharesToYieldTokens(shares: bigint) {
    const totalShares = this.vault.yieldTokenParams.totalShares;
    if (totalShares === 0n) return shares;

    return (shares * this.calculateUnrealizedActiveBalance()) / totalShares;
  }

  convertSharesToUnderlyingTokens(shares: bigint) {
    const amountYieldTokens = this.convertSharesToYieldTokens(shares);

    return this.convertYieldTokensToUnderlying(amountYieldTokens);
  }

  convertUnderlyingTokensToShares(amount: bigint) {
    const amountYieldTokens = this.convertUnderlyingTokensToYield(amount);
    return this.convertYieldTokensToShares(amountYieldTokens);
  }

  convertYieldTokensToUnderlying(amount: bigint) {
    const adapter = this.vault.tokenAdapter;
    const yieldTokenParams = this.vault.yieldTokenParams;

    return (amount * adapter.price) / 10n ** BigInt(yieldTokenParams.decimals);
  }

  convertUnderlyingTokensToYield(amount: bigint) {
    const adapter = this.vault.tokenAdapter;
    const yieldTokenParams = this.vault.yieldTokenParams;
    return (amount * 10n ** BigInt(yieldTokenParams.decimals)) / adapter.price;
  }

  calculateUnrealizedActiveBalance() {
    const yieldTokenParams = this.vault.yieldTokenParams;

    if (yieldTokenParams.activeBalance === 0n)
      return yieldTokenParams.activeBalance;

    const currentValue = this.convertYieldTokensToUnderlying(
      yieldTokenParams.activeBalance,
    );

    const expectedValue = yieldTokenParams.expectedValue;

    if (currentValue <= expectedValue) return yieldTokenParams.activeBalance;

    const harvestable = this.convertUnderlyingTokensToYield(
      currentValue - expectedValue,
    );

    if (harvestable === 0n) return yieldTokenParams.activeBalance;

    return yieldTokenParams.activeBalance - harvestable;
  }

  async normalizeUnderlyingToDebt(
    amount: bigint,
    publicClient: UsePublicClientReturnType,
  ) {
    if (!publicClient)
      throw new Error(
        "UNEXPECTED. No public client in normalize underlying to debt.",
      );

    const normalizedValue = await publicClient.readContract({
      address: this.vault.alchemist.address,
      abi: alchemistV2Abi,
      functionName: "normalizeUnderlyingTokensToDebt",
      args: [this.vault.underlyingToken, amount],
    });

    return normalizedValue;
  }
}

export const calculateMinimumOut = (amount: bigint, maximumLoss: bigint) => {
  const pow = 10n ** 7n;
  return amount - (amount * maximumLoss) / pow;
};
