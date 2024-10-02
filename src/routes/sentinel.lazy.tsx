import { Page } from "@/components/common/Page";
import { Sentinel } from "@/components/sentinel/Sentinel";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/sentinel")({
  component: SentinelRoute,
});

function SentinelRoute() {
  return (
    <Page
      title="Sentinel"
      description="Senatus Populusque Romanus"
      iconUri="./images/icons/sentinel.svg"
    >
      <Sentinel />
    </Page>
  );
}
