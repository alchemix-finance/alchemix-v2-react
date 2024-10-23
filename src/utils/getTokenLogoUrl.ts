import { VAULTS } from "@/lib/config/vaults";

// Build a mapping of yield token symbols to their respective image URLs.
const tokenLogoUrlsMapping = Object.values(VAULTS).flatMap((vaults) => {
  const yieldTokenSymbolWithImage = Object.values(vaults).map((vault) => ({
    symbol: vault.yieldSymbol,
    image: vault.image,
  }));
  return yieldTokenSymbolWithImage;
});

/**
 * Get the URL of the token logo.
 * @description If the token symbol exists in the manual mapping, we use the image from the mapping.
 * Otherwise we set it to the token symbol + .svg.
 * @dev We only use it in select places when token might be not in svg format.
 */
export const getTokenLogoUrl = (symbol: string | undefined) => {
  const tokenLogoUrl = tokenLogoUrlsMapping.find(
    (token) => token.symbol === symbol,
  )?.image;

  return tokenLogoUrl
    ? `/images/token-icons/${tokenLogoUrl}`
    : `/images/token-icons/${symbol}.svg`;
};
