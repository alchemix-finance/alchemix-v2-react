import { useProposals } from "@/lib/queries/useProposals";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import SnapshotIcon from "@/assets/logos/snapshot.svg?react";
import { Delegation } from "./Delegation";
import { Accordion } from "../ui/accordion";
import { ProposalsAccordionRow } from "./row/ProposalAccordionRow";
import { LoadingBar } from "../common/LoadingBar";
import { windowOpen } from "@/utils/windowOpen";

type ProposalFilter = "all" | "active" | "closed";

export const Governance = () => {
  const [proposalsFilter, setProposalsFilter] = useState<ProposalFilter>("all");
  const { data: proposals, isPending, isError } = useProposals();

  const filteredProposals = useMemo(() => {
    if (proposalsFilter === "all") {
      return proposals;
    }
    return proposals?.filter((proposal) => proposal.state === proposalsFilter);
  }, [proposals, proposalsFilter]);

  return (
    <div className="space-y-5">
      <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 rounded-sm border">
        <div className="bg-grey10inverse dark:bg-grey10 flex w-full flex-col gap-2 px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <p>Delegation Hub</p>
          <Button
            variant="action"
            weight="normal"
            onClick={() => windowOpen("https://snapshot.org/#/delegate")}
            className="border-grey5inverse text-white2inverse/80 dark:text-white2/80 hover:text-white2inverse dark:hover:text-white2 dark:border-grey5 h-8"
          >
            <SnapshotIcon className="h-5 w-5" />
            <p className="ml-4">Open on Snapshot</p>
          </Button>
        </div>
        <Delegation />
      </div>
      <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 rounded-sm border">
        <div className="bg-grey10inverse dark:bg-grey10 flex w-full flex-col gap-2 px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <Tabs
            value={proposalsFilter}
            onValueChange={(value) =>
              setProposalsFilter(value as ProposalFilter)
            }
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="closed">Closed</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="action"
            weight="normal"
            onClick={() =>
              windowOpen("https://snapshot.org/#/alchemixstakers.eth")
            }
            className="border-grey5inverse text-white2inverse/80 dark:text-white2/80 hover:text-white2inverse dark:hover:text-white2 dark:border-grey5 h-8"
          >
            <SnapshotIcon className="h-5 w-5" />
            <p className="ml-4">All proposals</p>
          </Button>
        </div>
        {isPending ? (
          <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 rounded-sm border">
            <div className="bg-grey10inverse dark:bg-grey10 flex space-x-4 px-6 py-4">
              <p className="inline-block self-center">Fetching data</p>
            </div>
            <div className="my-4 flex justify-center">
              <LoadingBar />
            </div>
          </div>
        ) : null}
        {isError && <p>Error. Unexpected. Contact Alchemix team.</p>}
        {filteredProposals && filteredProposals.length === 0 && (
          <p className="p-4">There are no proposals for selected filter.</p>
        )}
        {filteredProposals && filteredProposals.length > 0 && (
          <Accordion type="single" collapsible className="space-y-4 p-4">
            {filteredProposals.map((proposal) => (
              <ProposalsAccordionRow key={proposal.id} proposal={proposal} />
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};
