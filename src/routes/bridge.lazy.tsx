import { createLazyFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/common/Page";
import { BridgeWidget } from "@/components/bridge/BridgeWidget";

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
      <BridgeWidget />
    </Page>
  );
}
