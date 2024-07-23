import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/cn";
// text-white2inverse text-opacity-80
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded text-sm ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-neutral-50 hover:bg-neutral-900/90 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50/90",
        destructive:
          "bg-red-500 text-neutral-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-neutral-50 dark:hover:bg-red-900/90",
        outline:
          "text-md border border-green4 bg-green7 hover:bg-green4 hover:text-neutral-900 dark:border-white dark:bg-neutral-950 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        secondary:
          "bg-neutral-100 border border-gray-300 text-neutral-900 hover:bg-neutral-100/80 dark:bg-neutral-800 dark:text-neutral-50 dark:hover:bg-neutral-800/80",
        ghost:
          "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        link: "text-neutral-900 underline-offset-4 underline hover:no-underline dark:text-neutral-50",
        action:
          "border border-bronze3 bg-grey10inverse hover:bg-grey1inverse data-[state=active]:bg-grey1inverse data-[state=active]:text-bronze4",
      },
      size: {
        default: "h-12 px-3 py-1",
        sm: "h-9 rounded-sm px-3",
        lg: "h-11 rounded px-8",
        icon: "h-10 w-10",
      },
      shadow: {
        none: "",
        shadowed: "shadow shadow-sankoLightGreen",
      },
      width: {
        none: "",
        full: "w-full",
      },
      weight: {
        default: "font-medium",
        normal: "font-normal",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shadow: "none",
      width: "none",
      weight: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shadow,
      width,
      weight,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, shadow, width, weight, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
