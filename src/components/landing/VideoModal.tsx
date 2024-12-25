import { useRef } from "react";
import { useInView } from "framer-motion";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

export const VideoModal = ({
  delay,
  className,
}: {
  delay: number;
  className?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <Dialog>
      <div
        ref={ref}
        style={{
          transitionDelay: `${delay}s`,
        }}
        className={cn(
          "transition-all [transition-duration:1.1s]",
          isInView ? "opacity-100 blur-0" : "opacity-0 blur-sm",
          className,
        )}
      >
        <DialogTrigger
          style={{
            transition: `
              opacity 2s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s,
              color 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
          className={cn(
            // Base styles for the button
            "group relative z-10 inline-flex h-11 cursor-pointer items-center justify-center self-start rounded-xl border-0 px-8 py-5 font-sans text-xl font-medium tracking-tight text-[#1BEAA5] transition-all",
            // Apply multiple background layers
            "bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",
            // Background layers for the gradient effect
            "bg-[linear-gradient(#080a0e,#080a0e),linear-gradient(#1BEAA5,#1BEAA5),linear-gradient(90deg,#1BEAA5,#1BEAA5,#1BEAA5,#1BEAA5,#1BEAA5)]",
            // Animate in when in view
            isInView ? "opacity-100 blur-0" : "opacity-0 blur-sm",
            // Base styles for before pseudo-element
            "before:absolute before:bottom-[-10%] before:left-0 before:z-0 before:h-[30%] before:w-full before:animate-buttonMovingGradientBg before:bg-[linear-gradient(90deg,#080a0e,#1BEAA5,#080a0e,#1BEAA5,#080a0e)] before:bg-[length:200%] before:opacity-15 before:transition-opacity before:[filter:blur(1rem)]",
            // Hover pseudo-element for the glow effect
            "hover:before:animate-buttonMovingGradientBg hover:before:opacity-70",
          )}
        >
          <span className="relative z-10">
            <svg
              role="img"
              className="w-8 scale-125 rounded-xl text-red-500"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
            >
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
            </svg>
          </span>
        </DialogTrigger>
      </div>
      <DialogContent className="aspect-video sm:max-w-4xl">
        <div className="isolate size-full overflow-hidden">
          <iframe
            src="https://www.youtube.com/embed/FlWP9FC8C3c"
            className="size-full rounded-2xl"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};
