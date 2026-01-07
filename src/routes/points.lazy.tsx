import { createLazyFileRoute } from "@tanstack/react-router";

import { Page } from "@/components/common/Page";
import { Points } from "@/components/points/Points";
import { ErrorComponent } from "@/components/error/ErrorComponent";

export const Route = createLazyFileRoute("/points")({
  component: PointsRoute,
  errorComponent: ErrorComponent,
});

function PointsRoute() {
  return (
    <Page
      title="Migration Points"
      description="A page showing points for users transitioning from V2 to V3 vaults"
      iconUri="/images/icons/points_thick.svg"
    >
      <Points />
    </Page>
  );
}
