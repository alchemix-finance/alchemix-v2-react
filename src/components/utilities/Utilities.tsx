import { mainnet } from "viem/chains";

import { Button } from "@/components/ui/button";
import { V1Migration } from "./V1Migration";
import { useChain } from "@/hooks/useChain";
import { windowOpen } from "@/utils/windowOpen";

const utilities = [
  {
    label: "Alchemix Stats",
    author: "Barree",
    url: "https://alchemix-stats.com/",
    image: "alchemix_stats.png",
  },
  {
    label: "Self-Repaying-ENS",
    author: "Wary",
    url: "https://ens.alchemix.fi/",
    image: "srens.png",
  },
  {
    label: "AMO Harvest Tool",
    author: "Amrit & TBD",
    url: "https://alchemix-multisig.netlify.app/",
    image: "amo_harvester.png",
  },
  {
    label: "Contract Params Dashboard",
    author: "Build3rsLabs",
    url: "https://alchemix-dashboard-frontend-lovat.vercel.app/",
    image: "contract_params_dashboard.png",
  },
  {
    label: "alAsset University",
    author: "DoDao",
    url: "https://alchemix.tidbitshub.org/",
    image: "alchemix_tidbits.png",
  },
];

export const Utilities = () => {
  const chain = useChain();
  return (
    <>
      {chain.id === mainnet.id && <V1Migration />}
      <p className="my-6 text-center text-xs opacity-50">
        These tools are developed and maintained by our awesome community
        members.
      </p>
      <div className="flex w-full flex-row flex-wrap gap-4">
        {utilities.map((utility) => (
          <div
            key={utility.label}
            className="flex w-full flex-col rounded-sm border border-grey10inverse bg-grey15inverse sm:w-[48%] lg:w-1/4 dark:border-grey10 dark:bg-grey15"
          >
            <p className="border-b border-grey10inverse px-4 py-2 dark:border-grey10">
              {utility.label}
            </p>
            <div
              className="h-48 grow bg-cover bg-center"
              style={{
                backgroundImage: `url('../images/screenshots/${utility.image}')`,
              }}
            />
            <div className="flex flex-row items-center justify-between border-t border-grey10inverse px-4 py-2 dark:border-grey10">
              <div className="flex flex-row space-x-4">
                <p>{utility.author}</p>
              </div>
              <Button
                variant="ghost"
                className="h-8 min-w-[5rem] max-w-[6rem] border border-bronze1 text-base"
                onClick={() => windowOpen(utility.url)}
              >
                Open
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
