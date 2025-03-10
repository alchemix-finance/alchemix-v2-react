import { Fragment } from "react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useGetTokenPrice } from "@/lib/queries/useTokenPrice";
import { Farm } from "@/lib/types";
import { cn } from "@/utils/cn";
import { formatNumber } from "@/utils/number";

import { ExitButton } from "./ExitButton";
import { CurveFarmContent } from "./CurveFarmContent";
import { InternalFarmContent } from "./InternalFarmContent";
import { SushiFarmContent } from "./SushiFarmContent";

export const FarmsAccordionRow = ({ farm }: { farm: Farm }) => {
  const isActive = farm.isActive;
  return (
    <AccordionItem value={farm.uuid} disabled={!isActive}>
      <AccordionTrigger
        className={cn(
          "relative flex w-full flex-row flex-wrap items-center justify-between space-y-5 rounded-sm border border-grey3inverse bg-grey10inverse px-8 py-4 data-[state=open]:rounded-b-none data-[state=open]:border-b-0 lg:flex-nowrap lg:space-y-0 dark:border-grey3 dark:bg-grey10",
          isActive
            ? "grid-cols-7 hover:cursor-pointer"
            : "grid-cols-5 hover:cursor-default",
        )}
      >
        <div className="flex-2 flex w-full space-x-8">
          <div className="relative">
            <img
              src={`/images/icons/${farm.metadata.farmIcon}`}
              alt={farm.metadata.title}
              className="h-12 w-12"
            />
            {farm.metadata.tokenIcon && (
              <img
                src={`/images/icons/${farm.metadata.tokenIcon}.svg`}
                alt={farm.metadata.title}
                className="absolute left-6 top-6 h-9 w-9"
              />
            )}
          </div>
          <div>
            <p className="font-bold">{farm.metadata.title}</p>
            <p className="text-sm text-lightgrey10">{farm.metadata.subtitle}</p>
          </div>
        </div>
        <div className="flex-2 w-1/2 text-center">
          <p className="text-sm text-lightgrey10">Staked Token</p>
          <div className="w-full">
            <p className="">{formatNumber(farm.staked.amount)}</p>
            <p className="text-sm text-lightgrey10">
              {farm.staked.tokenSymbol}
            </p>
          </div>
        </div>
        {isActive ? (
          <>
            <div className="flex-2 w-1/2 text-center">
              <p className="text-sm text-lightgrey10">TVL</p>
              <TvlCell farm={farm} />
            </div>
            <div className="flex-2 w-1/2 text-center">
              <p className="text-sm text-lightgrey10">Rewards</p>
              <div className="flex flex-row justify-center space-x-2">
                {farm.rewards.map((reward, i) => (
                  <Fragment key={reward.tokenAddress}>
                    <div className="flex flex-col items-center space-y-1">
                      <img
                        src={`/images/icons/${reward.iconName}.svg`}
                        alt="{reward.tokenName}"
                        className="mx-auto h-7 w-7"
                      />
                      <p className="text-center text-sm text-lightgrey10">
                        {reward.tokenName}
                      </p>
                    </div>
                    {farm.rewards.length > 1 && i + 1 < farm.rewards.length && (
                      <div>+</div>
                    )}
                  </Fragment>
                ))}
              </div>
            </div>
            <div className="flex-2 w-1/2 text-center">
              <p className="text-sm text-lightgrey10">Yield</p>
              <p>{formatNumber(farm.yield.rate)}%</p>
            </div>
            <div className="flex-2 w-full text-center lg:w-1/2">
              <p className="text-sm text-lightgrey10">Action</p>
              <div className="flex justify-between space-x-2">
                <Button size="sm" weight="normal" variant="action">
                  Manage
                </Button>
                <ExitButton farm={farm} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex-2 w-1/2">
              <p className="text-center text-sm text-lightgrey10">
                Claimable Rewards
              </p>
              {farm.rewards.map((reward) => (
                <div key={reward.tokenAddress} className="w-full">
                  <p className="text-center">
                    {reward.amount} {reward.symbol}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex-2 w-1/2 text-center">
              <p className="text-sm text-lightgrey10">Action</p>
              <ExitButton farm={farm} />
            </div>
          </>
        )}
      </AccordionTrigger>
      <AccordionContent className="rounded-sm rounded-t-none border border-t-0 border-grey3inverse dark:border-grey3">
        {farm.type === "internal" && <InternalFarmContent farm={farm} />}
        {farm.type === "external-sushi" && <SushiFarmContent farm={farm} />}
        {farm.type === "external-curve" && <CurveFarmContent farm={farm} />}
      </AccordionContent>
    </AccordionItem>
  );
};

const TvlCell = ({ farm }: { farm: Farm }) => {
  const tokenAddress =
    farm.metadata.tokenIcon === "saddle"
      ? "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
      : farm.metadata.tokenIcon === "tokemak"
        ? "0xdbdb4d16eda451d0503b854cf79d55697f90c8df"
        : farm.poolTokenAddress;

  const { currency } = useSettings();
  const { data: internalTokenPrice = 0 } = useGetTokenPrice(tokenAddress);

  const tvl =
    farm.type === "internal" ? internalTokenPrice * +farm.reserve : farm.tvl;

  return (
    <div className="flex flex-col items-center text-center">
      <p>
        {formatNumber(tvl, {
          isCurrency: true,
          // NOTE: Curve TVL Calculation doesn't account for currency selected, because uses virtual price from contract.
          currency: farm.type !== "external-curve" ? currency : undefined,
        })}
      </p>
      {farm.type === "internal" && (
        <p className="text-sm text-lightgrey10">
          {formatNumber(farm.reserve)} {farm.tokenSymbol}
        </p>
      )}
    </div>
  );
};
