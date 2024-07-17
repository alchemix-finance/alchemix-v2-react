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
      "relative h-4 w-full overflow-hidden rounded-full bg-[#6C93C7]/20 dark:bg-[#F5C59F]/20",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator className="animate-loading-bar h-full w-full flex-1 bg-[#6C93C7] transition-all dark:bg-[#F5C59F]" />
  </ProgressPrimitive.Root>
));
LoadingBar.displayName = ProgressPrimitive.Root.displayName;

export { LoadingBar };
