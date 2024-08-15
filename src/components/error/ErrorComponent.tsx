import { useEffect, useRef, useState } from "react";
import { ErrorComponentProps, useLocation } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Page } from "@/components/common/Page";
import { cn } from "@/utils/cn";

/**
 * NOTE: In production the error stack trace is minified.
 * @link https://github.com/facebook/create-react-app/issues/3753#issuecomment-356998249
 * The way to find an error is open React DevTools, and find the component using minified name.
 */

export const ErrorComponent = (props: ErrorComponentProps) => {
  const location = useLocation();

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
    const locationStringified = JSON.stringify(location, null, 2);
    const error = JSON.stringify(
      { errorStr: errorStringified, location: locationStringified },
      null,
      2,
    );
    navigator.clipboard.writeText(error);
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
