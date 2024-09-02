import { createLazyFileRoute } from "@tanstack/react-router";

import { Landing } from "@/components/landing/Landing";

export const Route = createLazyFileRoute("/")({
  component: Landing,
});
