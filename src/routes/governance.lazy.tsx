import { Page } from "@/components/common/Page";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/governance")({
  component: Governance,
});

function Governance() {
  return (
    <Page title="Governance" description="Alchemix Improvement Proposals">
      <div>WIP.</div>
    </Page>
  );
}
