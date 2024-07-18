import { Page } from "@/components/common/Page";
import { Debug } from "@/components/debug/Debug";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/debug")({
  component: DebugRoute,
});

function DebugRoute() {
  return (
    <Page
      title="Debug"
      description="Tenderly Fork debugging"
      iconUri="/images/icons/alchemix.svg"
    >
      <Debug />
    </Page>
  );
}
