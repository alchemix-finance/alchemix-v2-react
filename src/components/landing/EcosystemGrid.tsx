import { ReactNode } from "react";
import { ArrowRightIcon, FileIcon, NewspaperIcon } from "lucide-react";

import XPrevTwitterIcon from "@/assets/logos/x.svg?react";
import DiscordIcon from "@/assets/logos/discord.svg?react";

import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

const socials = [
  {
    title: "Twitter",
    description:
      "Stay up to date with the latest Alchemix news and community updates.",
    href: "#",
    cta: "Follow us on X",
    Icon: XPrevTwitterIcon,
    background: null,
    className: "lg:col-span-1 lg:row-span-1",
  },
  {
    title: "Discord",
    description:
      "Participate in active Alchemix community discussions and get user support.",
    href: "#",
    cta: "Join Discord",
    Icon: DiscordIcon,
    background: null,
    className: "lg:col-span-2 lg:row-span-1",
  },
  {
    title: "Documentation",
    description:
      "Build with us! Our documentation offers everything you need to get started.",
    href: "#",
    cta: "Read the docs",
    Icon: FileIcon,
    background: null,
    className: "lg:col-span-2",
  },
  {
    title: "Newsletter",
    description: "News, stats and reports concocted by the Alchemix community.",
    href: "https://alchemixfi.substack.com/",
    cta: "Subscribe",
    Icon: NewspaperIcon,
    background: null,
    className: "lg:col-span-1",
  },
];

export const EcosystemGrid = () => {
  return (
    <div className="grid w-full auto-rows-[15rem] grid-cols-3 gap-4">
      {socials.map((social) => (
        <BentoCard key={social.title} {...social} />
      ))}
    </div>
  );
};

const BentoCard = ({
  title,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  title: string;
  className: string;
  background: ReactNode;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  description: string;
  href: string;
  cta: string;
}) => (
  <div
    className={cn(
      "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
      // light styles
      "bg-grey10inverse [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "transform-gpu dark:bg-grey10 dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className,
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
      <Icon className="h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75" />
      <h3 className="text-xl font-semibold text-neutral-700 dark:text-neutral-300">
        {title}
      </h3>
      <p className="max-w-lg text-neutral-400">{description}</p>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
      )}
    >
      <Button
        variant="ghost"
        asChild
        size="sm"
        className="pointer-events-auto bg-grey15inverse hover:bg-grey5inverse dark:bg-grey15 dark:hover:bg-grey5"
      >
        <a href={href}>
          {cta}
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
);

export { BentoCard };
