import { useProposals } from "@/lib/queries/useProposals";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buttonVariants } from "../ui/button";

import { Delegation } from "./Delegation";
import { Accordion } from "../ui/accordion";
import { ProposalsAccordionRow } from "./row/ProposalAccordionRow";
import { LoadingBar } from "../common/LoadingBar";

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
      <div className="rounded border border-grey10inverse bg-grey15inverse">
        <div className="flex flex-col gap-2 px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-0">
          <p>Delegation Hub</p>
          <a
            className={buttonVariants({
              variant: "link",
            })}
            href="https://snapshot.org/#/delegate"
            target="_blank"
            rel="noreferrer noopener"
          >
            Delegate on Snapshot
          </a>
        </div>
        <Delegation />
      </div>
      <div className="rounded border border-grey10inverse bg-grey15inverse">
        <div className="flex flex-col gap-2 px-6 py-4 text-sm lg:flex-row lg:items-center lg:justify-between lg:gap-0">
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
          <a
            className={buttonVariants({
              variant: "link",
            })}
            href="https://snapshot.org/#/alchemixstakers.eth"
            target="_blank"
            rel="noreferrer noopener"
          >
            Open all proposals
          </a>
        </div>
        {isPending ? (
          <div className="rounded border border-grey10inverse bg-grey15inverse">
            <div className="flex space-x-4 bg-grey10inverse px-6 py-4">
              <p className="inline-block self-center">Fetching data</p>
            </div>
            <div className="my-4 flex justify-center">
              <LoadingBar />
            </div>
          </div>
        ) : null}
        {isError && <p>Error. Unexpected. Contact Alchemix team.</p>}
        {filteredProposals && filteredProposals.length === 0 && (
          <p>There are no proposals for selected filter.</p>
        )}
        {filteredProposals && filteredProposals.length > 0 && (
          <Accordion type="single" collapsible>
            {filteredProposals.map((proposal) => (
              <ProposalsAccordionRow key={proposal.id} proposal={proposal} />
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};
