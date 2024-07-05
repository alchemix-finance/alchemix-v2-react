import { Page } from "@/components/common/Page";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/farms")({
  component: FarmsRoute,
});

function FarmsRoute() {
  return (
    <Page title="Farms" description="Earn yield on your deposits">
      <p>WIP.</p>
    </Page>
  );
}
