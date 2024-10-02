import { Page } from "@/components/common/Page";
import { ErrorComponent } from "@/components/error/ErrorComponent";
import { Governance } from "@/components/governance/Governance";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/governance")({
  component: GovernanceRoute,
  errorComponent: ErrorComponent,
});

function GovernanceRoute() {
  return (
    <Page
      title="Governance"
      description="Alchemix Improvement Proposals"
      iconUri="./images/icons/alcx_thin.svg"
    >
      <Governance />
    </Page>
  );
}
