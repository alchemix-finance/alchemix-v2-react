import { useChain } from "@/hooks/useChain";
import { Vault } from "@/lib/types";
import { ExternalLinkIcon } from "lucide-react";

export const Info = ({ vault }: { vault: Vault }) => {
  const chain = useChain();

  const info = {
    alchemist: { label: "Alchemist", address: vault.alchemist.address },
    debtToken: { label: "Debt Token", address: vault.alchemist.debtToken },
    underlyingToken: {
      label: "Underlying Token",
      address: vault.underlyingToken,
    },
    yieldToken: { label: "Yield Token", address: vault.address },
    yieldTokenOverride: {
      label: "Yield Token Override",
      address: vault.metadata.yieldTokenOverride,
    },
    gateway: {
      label: "Gateway",
      address: vault.metadata.gateway,
    },
    wethGateway: {
      label: "WETH Gateway",
      address: vault.metadata.wethGateway,
    },
  } as const;

  return (
    <div className="flex flex-col space-y-4">
      <p className="text-lightgrey10 w-full self-center text-sm">
        List of contracts associated with this vault:
      </p>
      <div className="border-grey5inverse bg-grey1inverse dark:border-grey5 dark:bg-grey1 flex flex-col flex-wrap items-center justify-center gap-2 rounded-sm border p-4 break-all">
        {Object.values(info).map(({ label, address }) => {
          if (!address) return null;
          return (
            <div
              key={address + label}
              className="flex w-full flex-col items-center justify-center gap-4 rounded-sm px-2 lg:flex-row"
            >
              <p className="flex-1">{label}:</p>
              <p className="font-alcxMono">
                <a
                  href={`${chain.blockExplorers.default.url}/address/${address}`}
                  rel="noreferrer noopener"
                  target="_blank"
                  className="flex items-center gap-2 underline hover:no-underline"
                >
                  {address}
                  <ExternalLinkIcon className="h-4 w-4" />
                </a>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
