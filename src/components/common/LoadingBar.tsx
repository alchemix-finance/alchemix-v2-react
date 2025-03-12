import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/utils/cn";

const LoadingBar = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-1 w-32 overflow-hidden bg-blue3/20 dark:bg-bronze1/20",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator className="absolute h-full flex-1 animate-loading-bar rounded-xs bg-blue3 will-change-transform fill-mode-forwards dark:bg-bronze1" />
  </ProgressPrimitive.Root>
));
LoadingBar.displayName = ProgressPrimitive.Root.displayName;

export { LoadingBar };
