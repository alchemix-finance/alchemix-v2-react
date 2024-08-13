import { Page } from "@/components/common/Page";
import { ErrorComponent } from "@/components/error/ErrorComponent";
import { Transmuters } from "@/components/transmuters/Transmuters";
import { useChain } from "@/hooks/useChain";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transmuters")({
  component: TransmutersRoute,
  errorComponent: ErrorComponent,
});

function TransmutersRoute() {
  const chain = useChain();
  return (
    <Page
      title="Transmuter"
      description="Convert your synthetic tokens to their counterpart at a 1:1 ratio"
      iconUri="/images/icons/transmuter_thin.svg"
    >
      <Transmuters key={chain.id} />
    </Page>
  );
}
