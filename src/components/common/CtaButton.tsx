import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ComponentPropsWithRef } from "react";
import { AnimatePresence, m } from "framer-motion";

import { Button } from "@/components/ui/button";

/**
 * Button that opens connect modal if the user is not connected.
 */
export const CtaButton = (
  props: Omit<ComponentPropsWithRef<typeof Button>, "children"> & {
    children: string;
  },
) => {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  return (
    <Button
      {...props}
      onClick={!address ? openConnectModal : props.onClick}
      disabled={!address ? false : props.disabled}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={!address ? "connect wallet" : props.children}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 25 }}
        >
          {!address ? "Connect Wallet" : props.children}
        </m.span>
      </AnimatePresence>
    </Button>
  );
};
