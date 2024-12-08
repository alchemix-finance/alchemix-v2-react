import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { MinusIcon, PlusIcon } from "lucide-react";

import { cn } from "@/utils/cn";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={className} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger ref={ref} asChild {...props}>
      <div
        className={cn(
          "group relative flex flex-1 justify-between py-4 transition-all hover:cursor-pointer [&[data-state=open]>button]:rotate-90",
          className,
        )}
      >
        {children}
        <button className="absolute -left-2 top-8 flex h-6 w-6 shrink-0 items-center justify-center rounded border border-bronze3 bg-grey10inverse text-opacity-80 transition-transform duration-200 hover:bg-grey1inverse hover:text-opacity-100 dark:bg-grey10 dark:hover:bg-grey1">
          <PlusIcon className="hidden h-3 w-3 animate-in fade-in-50 group-data-[state=closed]:block" />
          <MinusIcon className="hidden h-3 w-3 -rotate-90 group-data-[state=open]:block" />
        </button>
      </div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="data-[state=closed]:animate-reduced-motion-accordion-up data-[state=open]:animate-reduced-motion-accordion-down overflow-hidden text-sm transition-all motion-safe:data-[state=closed]:animate-accordion-up motion-safe:data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));

AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
