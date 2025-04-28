import * as React from "react";
import { Progress as ProgressPrimitive } from "radix-ui";

import { cn } from "@/utils/cn";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "border-bronze1inverse bg-bronze4inverse dark:border-bronze1 dark:bg-bronze4 relative h-2 w-full overflow-hidden rounded-sm border",
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="bg-bronze1inverse dark:bg-bronze1 h-full w-full flex-1 transition-all duration-300"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
