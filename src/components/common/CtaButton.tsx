import { useAccount } from "wagmi";
import { Button } from "../ui/button";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ComponentPropsWithRef } from "react";

/**
 * Button that opens connect modal if the user is not connected.
 */
export const CtaButton = (props: ComponentPropsWithRef<typeof Button>) => {
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  return (
    <Button
      {...props}
      onClick={!address ? openConnectModal : props.onClick}
      disabled={!address ? false : props.disabled}
    >
      {!address ? "Connect Wallet" : props.children}
    </Button>
  );
};
