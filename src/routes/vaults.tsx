import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/common/Page";
import { Vaults } from "@/components/vaults/Vaults";

export const Route = createFileRoute("/vaults")({
  component: VaultsRoute,
});

function VaultsRoute() {
  return (
    <Page
      title="Vaults"
      description="Deposit collateral and borrow your future yield right away."
      iconUri="/images/icons/yield_thin.svg"
    >
      <Vaults />
    </Page>
  );
}
