import { createLazyFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/common/Page";
import { BridgeClosed } from "@/components/bridge/BridgeClosed";
import { ErrorComponent } from "@/components/error/ErrorComponent";

export const Route = createLazyFileRoute("/bridge")({
  component: BridgeRoute,
  errorComponent: ErrorComponent,
});

function BridgeRoute() {
  return (
    <Page
      title="Bridge"
      description="Transfer your tokens to other chains"
      iconUri="/images/icons/swap_thin.svg"
    >
      <BridgeClosed />
    </Page>
  );
}
