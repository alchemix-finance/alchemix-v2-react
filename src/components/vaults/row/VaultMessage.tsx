import { VaultMessage as VaultMessageType } from "@/lib/config/metadataTypes";
import { cn } from "@/utils/cn";

const messageConfig = {
  info: "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z",
  warning:
    "M12 10.5v3.75m-9.303 3.376C1.83 19.126 2.914 21 4.645 21h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 4.88c-.866-1.501-3.032-1.501-3.898 0L2.697 17.626zM12 17.25h.007v.008H12v-.008z",
  error:
    "M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z",
} as const;

export const VaultMessage = (props: { message: VaultMessageType }) => {
  const { message, type, linkHref, linkLabel } = props.message;
  return (
    <div
      className={cn(
        "text-l flex w-full flex-row items-center space-x-4 rounded border p-2 pl-4 text-grey15",
        type === "info" && "border-blue1 bg-blue1/50",
        type === "warning" && "border-orange2 bg-orange1",
        type === "error" && "border-red3 bg-red1",
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-8 w-8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d={messageConfig[type]}
        ></path>
      </svg>
      <p>
        {message}
        {linkHref && (
          <>
            <span> </span>
            <a
              href={linkHref}
              target="_blank"
              rel="noreferrer"
              className="underline hover:no-underline"
            >
              {linkLabel ?? "Learn more."}
            </a>
          </>
        )}
      </p>
    </div>
  );
};
