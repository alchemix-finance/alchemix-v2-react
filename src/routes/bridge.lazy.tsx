import { createLazyFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/common/Page";
import { Button } from "@/components/ui/button";
import { windowOpen } from "@/utils/windowOpen";
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
      <div className="space-y-2">
        <p>We are integrating bridge into Alchemix App.</p>
        <p>Proceed to Connext App to bridge:</p>
        <div className="flex items-center gap-2">
          <Button
            variant="action"
            onClick={() =>
              windowOpen(
                "https://bridge.connext.network/ALCHEMIX-from-ethereum-to-arbitrum?symbol=ALCX",
              )
            }
          >
            ALCX
          </Button>
          <Button
            variant="action"
            onClick={() =>
              windowOpen(
                "https://bridge.connext.network/ALUSD-from-ethereum-to-arbitrum?symbol=alUSD",
              )
            }
          >
            alUSD
          </Button>
          <Button
            variant="action"
            onClick={() =>
              windowOpen(
                "https://bridge.connext.network/ALETH-from-ethereum-to-arbitrum?symbol=alETH",
              )
            }
          >
            alETH
          </Button>
        </div>
      </div>
    </Page>
  );
}
