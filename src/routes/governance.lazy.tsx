import { Page } from "@/components/common/Page";
import { Governance } from "@/components/governance/Governance";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/governance")({
  component: GovernanceRoute,
});

function GovernanceRoute() {
  return (
    <Page title="Governance" description="Alchemix Improvement Proposals">
      <Governance />
    </Page>
  );
}
