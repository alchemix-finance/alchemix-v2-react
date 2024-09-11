import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/common/Page";
import { Vaults } from "@/components/vaults/Vaults";
import { ErrorComponent } from "@/components/error/ErrorComponent";
import { useChain } from "@/hooks/useChain";

export const Route = createFileRoute("/vaults")({
  component: VaultsRoute,
  errorComponent: ErrorComponent,
});

function VaultsRoute() {
  const chain = useChain();
  return (
    <Page
      title="Vaults"
      description="Deposit collateral and borrow your future yield right away."
      iconUri="/alchemix-v2-react/images/icons/vaults_thin.svg"
    >
      <Vaults key={chain.id} />
    </Page>
  );
}
