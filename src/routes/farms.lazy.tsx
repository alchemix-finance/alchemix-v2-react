import { Page } from "@/components/common/Page";
import { Farms } from "@/components/farms/Farms";
import { createLazyFileRoute, ErrorComponent } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/farms")({
  component: FarmsRoute,
  errorComponent: ErrorComponent,
});

function FarmsRoute() {
  return (
    <Page
      title="Farms"
      description="Earn yield on your deposits"
      iconUri="/alchemix-v2-react/images/icons/farm_thin.svg"
    >
      <Farms />
    </Page>
  );
}
