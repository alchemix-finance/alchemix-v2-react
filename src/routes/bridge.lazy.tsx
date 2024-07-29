import { createLazyFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/common/Page";
import { Bridge } from "@/components/bridge/Bridge";

export const Route = createLazyFileRoute("/bridge")({
  component: BridgeRoute,
});

function BridgeRoute() {
  return (
    <Page
      title="Bridge"
      description="Transfer your tokens to other chains"
      iconUri="/images/icons/swap_thin.svg"
    >
      <Bridge />
    </Page>
  );
}
