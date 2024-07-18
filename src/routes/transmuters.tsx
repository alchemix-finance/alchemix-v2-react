import { Page } from "@/components/common/Page";
import { Transmuters } from "@/components/transmuters/Transmuters";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/transmuters")({
  component: TransmutersRoute,
});

function TransmutersRoute() {
  return (
    <Page
      title="Transmuter"
      description="Convert your synthetic tokens to their counterpart at a 1:1 ratio"
      iconUri="/images/icons/transmuter_thin.svg"
    >
      <Transmuters />
    </Page>
  );
}
