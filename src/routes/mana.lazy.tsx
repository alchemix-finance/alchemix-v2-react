import { createLazyFileRoute } from "@tanstack/react-router";

import { Page } from "@/components/common/Page";
import { Points } from "@/components/points/Points";
import { ErrorComponent } from "@/components/error/ErrorComponent";

export const Route = createLazyFileRoute("/mana")({
  component: PointsRoute,
  errorComponent: ErrorComponent,
});

function PointsRoute() {
  return (
    <Page
      title="Migration Mana"
      description="Track and learn about your Migration Mana"
      iconUri="/images/icons/points_thick.svg"
    >
      <Points />
    </Page>
  );
}
