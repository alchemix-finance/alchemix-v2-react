import { useState } from "react";
import { lsService } from "@/lib/localStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { mainnet } from "viem/chains";
import { IS_TENDERLY_FORK } from "@/lib/wagmi/tenderly";

export const Debug = () => {
  const [tenderlyForkRpc, setTenderlyForkRpc] = useState<string>(
    lsService.getItem(mainnet.id, "tenderlyForkRpc") ?? "",
  );

  const handleTenderlyFork = () => {
    if (IS_TENDERLY_FORK) {
      lsService.setItem(1, "tenderlyForkRpc", "");
    } else {
      lsService.setItem(1, "tenderlyForkRpc", tenderlyForkRpc);
    }
    window.location.reload();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center">
        <p>Tenderly RPC:</p>
        <Input
          type="text"
          value={tenderlyForkRpc}
          onChange={(e) => setTenderlyForkRpc(e.target.value)}
        />
        <Button onClick={handleTenderlyFork}>
          {IS_TENDERLY_FORK ? "Reset" : "Set"}
        </Button>
      </div>
    </div>
  );
};
