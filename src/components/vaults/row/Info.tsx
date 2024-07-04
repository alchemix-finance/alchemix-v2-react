import { useChain } from "@/hooks/useChain";
import { Vault } from "@/lib/types";
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
      address: vault.metadata.gateway ?? vault.metadata.wethGateway,
    },
    strategy: {
      label: "Strategy",
      address: vault.metadata.strategy,
      vanity: vault.metadata.label,
    },
  } as const;
  return (
    <div className="flex flex-col space-y-4">
      <p className="text-lightgrey10 w-full self-center text-sm">
        List of contracts associated with this vault:
      </p>
      <div className="border-grey5inverse bg-grey1inverse text-white2inverse flex flex-col flex-wrap items-center justify-center gap-2 break-all rounded p-4">
        {Object.values(info).map(({ label, address }) => {
          if (!address) return null;
          return (
            <div
              key={address + label}
              className="hover:bg-black2 flex w-full flex-col items-center justify-center gap-4 rounded px-2 lg:flex-row"
            >
              <p className="flex-1">{label}:</p>
              <p className="flex-2 font-alcxMono">
                <a
                  href={`${chain.blockExplorers.default.url}/address/${address}`}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {address}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="inline h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    ></path>
                  </svg>
                </a>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
