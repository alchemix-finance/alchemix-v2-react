import { Page } from "@/components/common/Page";
import { Farms } from "@/components/farms/Farms";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/farms")({
  component: FarmsRoute,
});

function FarmsRoute() {
  return (
    <Page title="Farms" description="Earn yield on your deposits">
      <Farms />
    </Page>
  );
}
