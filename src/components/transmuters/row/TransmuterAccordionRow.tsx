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
      <AccordionTrigger className="grid grid-cols-2 gap-2 rounded border border-grey3inverse bg-grey10inverse px-8 py-4 data-[state=open]:rounded-b-none data-[state=open]:border-b-0 dark:border-grey3 dark:bg-grey10 sm:grid-cols-3 lg:grid-cols-4">
        <div className="col-span-2 flex justify-start pl-4 sm:col-span-3 lg:col-span-1">
          <div className="flex flex-row space-x-8">
            <div className="relative">
              <img
                src={SYNTH_ASSETS_METADATA[transmuter.metadata.synthAsset].icon}
                alt={syntheticToken?.symbol}
                className="h-12 w-12 min-w-12"
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
            <div className="text-left">
              <p className="font-bold">{transmuter.metadata.label}</p>
              <p className="text-sm text-lightgrey10">{`${syntheticToken?.symbol ?? "..."}-${
                underlyingToken?.symbol ?? "..."
              }`}</p>
              <p className="text-sm text-lightgrey10">LTV: 50%</p>
            </div>
          </div>
        </div>
        <div>
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
        <div>
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
        <div>
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
      <AccordionContent className="flex flex-col items-center gap-5 rounded-b border border-t-0 border-grey3inverse bg-grey15inverse p-4 dark:border-grey3 dark:bg-grey15 lg:flex-row">
        <div className="flex w-full flex-col gap-4 rounded bg-grey10inverse p-4 dark:bg-grey10">
          {syntheticToken && (
            <Deposit transmuter={transmuter} syntheticToken={syntheticToken} />
          )}
        </div>

        <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4 dark:bg-grey10">
          {syntheticToken && (
            <Withdraw transmuter={transmuter} syntheticToken={syntheticToken} />
          )}
        </div>

        <div className="flex w-full flex-col space-y-4 rounded bg-grey10inverse p-4 dark:bg-grey10">
          {syntheticToken && (
            <Claim transmuter={transmuter} syntheticToken={syntheticToken} />
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
