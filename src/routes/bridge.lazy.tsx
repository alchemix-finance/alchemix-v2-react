import { createLazyFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/common/Page";
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
      <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 mx-auto max-w-lg space-y-4 rounded-md border p-8 text-center">
        <img
          src="/images/icons/swap_thin.svg"
          alt=""
          className="mx-auto size-12"
          aria-hidden="true"
        />
        <p className="font-alcxTitles text-2xl">
          Bridge Temporarily Unavailable
        </p>
        <p className="text-lightgrey10inverse dark:text-lightgrey10">
          The bridge is down for maintenance as we prepare for the v3 launch. It
          will be back up soon.
        </p>
      </div>
    </Page>
  );
}
