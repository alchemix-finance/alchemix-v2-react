import {
  AccordionTrigger,
  AccordionItem,
  AccordionContent,
} from "@/components/ui/accordion";
import { CurrencyCell } from "@/components/vaults/row/VaultAccordionRow";
import { SYNTH_ASSETS_METADATA } from "@/lib/config/synths";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { Transmuter } from "@/lib/types";
import { useMemo } from "react";
import { Deposit } from "./Deposit";
import { Withdraw } from "./Withdraw";
import { Claim } from "./Claim";

export const TransmuterAccordionRow = ({
  transmuter,
}: {
  transmuter: Transmuter;
}) => {
  const { data: tokens } = useTokensQuery();
  const syntheticToken = useMemo(
    () =>
      tokens?.find(
        (t) =>
          t.address.toLowerCase() === transmuter.syntheticToken.toLowerCase(),
      ),
    [tokens, transmuter.syntheticToken],
  );
  const underlyingToken = useMemo(
    () =>
      tokens?.find(
        (t) =>
          t.address.toLowerCase() === transmuter.underlyingToken.toLowerCase(),
      ),
    [tokens, transmuter.underlyingToken],
  );
  const totalDeposited =
    transmuter.account.exchangedBalance + transmuter.account.unexchangedBalance;
  return (
    <AccordionItem value={transmuter.address}>
      <AccordionTrigger className="flex w-full max-w-full flex-wrap rounded border border-grey3inverse bg-grey10inverse px-8 py-4 hover:cursor-pointer lg:flex-row lg:flex-nowrap lg:justify-between lg:gap-2">
        <div className="flex-2 w-full pb-3 lg:pb-0">
          <div className="flex flex-row space-x-8">
            <div className="relative">
              <img
                src={SYNTH_ASSETS_METADATA[transmuter.metadata.synthAsset].icon}
                alt={syntheticToken?.symbol}
                className="h-12 w-12"
              />
              <img
                src={
                  "/images/icons/" +
                  underlyingToken?.symbol.toLowerCase() +
                  ".svg"
                }
                alt={transmuter.metadata.label}
                className="absolute left-6 top-6 h-9 w-9"
              />
            </div>
            <div>
              <p className="font-bold">{transmuter.metadata.label}</p>
              <p className="text-sm text-lightgrey10">{`${syntheticToken?.symbol ?? "..."}-${
                underlyingToken?.symbol ?? "..."
              }`}</p>
              <p className="text-sm text-lightgrey10">LTV: 50%</p>
            </div>
          </div>
        </div>
        <div className="lg:flex-2 w-1/2 lg:w-full">
          <p className="text-center text-sm text-lightgrey10">Deposited</p>
          {syntheticToken && (
            <CurrencyCell
              tokenAmount={totalDeposited}
              tokenAddress={syntheticToken.address}
              tokenSymbol={syntheticToken.symbol}
              tokenDecimals={syntheticToken.decimals}
            />
          )}
        </div>
        <div className="lg:flex-2 w-1/2 lg:w-full">
          <p className="text-center text-sm text-lightgrey10">Withdrawable</p>
          {syntheticToken && (
            <CurrencyCell
              tokenAmount={transmuter.account.unexchangedBalance}
              tokenAddress={syntheticToken.address}
              tokenSymbol={syntheticToken.symbol}
              tokenDecimals={syntheticToken.decimals}
            />
          )}
        </div>
        <div className="flex-2 w-full">
          <p className="text-center text-sm text-lightgrey10">Claimable</p>
          {underlyingToken && (
            <CurrencyCell
              tokenAmount={transmuter.account.claimableBalance}
              tokenAddress={underlyingToken.address}
              tokenSymbol={underlyingToken.symbol}
              tokenDecimals={underlyingToken.decimals}
            />
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex items-center gap-5 border border-grey10inverse bg-grey15inverse p-4">
        <div className="flex w-full flex-col gap-4 rounded bg-grey10inverse p-4">
          {syntheticToken && (
            <Deposit transmuter={transmuter} syntheticToken={syntheticToken} />
          )}
        </div>

        <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4">
          {syntheticToken && (
            <Withdraw transmuter={transmuter} syntheticToken={syntheticToken} />
          )}
        </div>

        <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4">
          {syntheticToken && (
            <Claim transmuter={transmuter} syntheticToken={syntheticToken} />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
