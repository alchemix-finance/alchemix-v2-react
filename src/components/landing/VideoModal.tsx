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
          className={cn(
            // Base styles for the button
            "group relative inline-flex h-11 w-14 items-center justify-center overflow-hidden rounded-xl border-[0.08rem] border-[#1BEAA5] bg-[#1BEAA5] transition-all",

            // Shadow and hover effect
            "shadow-md hover:border-[#FF5733] hover:bg-[#FF5733]",
          )}
        >
          {/* SVG YouTube Logo */}
          <svg
            role="img"
            className="scale-125 rounded-xl text-[#080A0E]" // Let the SVG fill the container
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
          >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
          </svg>
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
