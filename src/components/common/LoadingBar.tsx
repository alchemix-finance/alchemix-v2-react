import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/utils/cn";

const LoadingBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "bg-blue3/20 dark:bg-bronze1/20 relative h-1 w-32 overflow-hidden",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator className="animate-loading-bar bg-blue3 fill-mode-forwards dark:bg-bronze1 absolute h-full flex-1 rounded-xs will-change-transform" />
  </ProgressPrimitive.Root>
));
LoadingBar.displayName = ProgressPrimitive.Root.displayName;

export { LoadingBar };
