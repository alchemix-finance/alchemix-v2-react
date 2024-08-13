import { useEffect, useRef, useState } from "react";
import { ErrorComponentProps } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Page } from "@/components/common/Page";
import { cn } from "@/utils/cn";

export const ErrorComponent = (props: ErrorComponentProps) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const isNewVersionError = props.error.message.includes(
    "Failed to fetch dynamically imported module",
  );

  const onErrorButton = () => {
    if (isNewVersionError) {
      return window.location.reload();
    }
    const errorStringified = JSON.stringify(
      props.error,
      Object.getOwnPropertyNames(props.error),
      2,
    );
    navigator.clipboard.writeText(errorStringified);
    setCopied(true);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Page
      title="Alchemix"
      description="There has been an error"
      iconUri="/images/icons/alchemix.svg"
    >
      <div className="space-y-5">
        <p className={cn("p-2", !isNewVersionError && "text-red-500")}>
          {isNewVersionError
            ? "New dApp version is available. Please, reload the page."
            : props.error.message}
        </p>
        <Button
          variant="action"
          onClick={onErrorButton}
          disabled={copied}
          className="w-40"
        >
          {isNewVersionError ? "Reload" : copied ? "Copied" : "Copy Error Log"}
        </Button>
      </div>
    </Page>
  );
};
