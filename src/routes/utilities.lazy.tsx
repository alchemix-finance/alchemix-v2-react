import { createLazyFileRoute } from "@tanstack/react-router";

import { Page } from "@/components/common/Page";
import { Utilities } from "@/components/utilities/Utilities";
import { ErrorComponent } from "@/components/error/ErrorComponent";

export const Route = createLazyFileRoute("/utilities")({
  component: UtilitiesRoute,
  errorComponent: ErrorComponent,
});

function UtilitiesRoute() {
  return (
    <Page
      title="Utilities"
      description="A collection of useful tools"
      iconUri="/images/icons/utilities_thin.svg"
    >
      <Utilities />
    </Page>
  );
}
