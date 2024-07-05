import { useChain } from "@/hooks/useChain";
import { mainnet } from "viem/chains";
import { Button } from "../ui/button";
import { useSwitchChain } from "wagmi";

export const Farms = () => {
  const chain = useChain();
  const { switchChain } = useSwitchChain();
  return (
    <div>
      {chain.id !== mainnet.id ? (
        <div>
          <p>Farms only supported on Ethereum Mainnet currently.</p>
          <Button
            onClick={() =>
              switchChain({
                chainId: mainnet.id,
              })
            }
          >
            Switch to Ethereum
          </Button>
        </div>
      ) : (
        <p>WIP.</p>
      )}
    </div>
  );
};
