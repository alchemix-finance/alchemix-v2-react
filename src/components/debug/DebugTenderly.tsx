import { useState } from "react";
import { lsService } from "@/lib/localStorage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IS_TENDERLY_FORK,
  TENDERLY_FORK_RPC,
  TENDERLY_FORK_CHAIN_ID,
} from "@/lib/wagmi/tenderly";
import { chains } from "@/lib/wagmi/chains";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const DebugTenderly = () => {
  const [tenderlyForkRpc, setTenderlyForkRpc] = useState(
    TENDERLY_FORK_RPC ?? "",
  );
  const [tenderlyForkChainId, setTenderlyForkChainId] = useState(
    TENDERLY_FORK_CHAIN_ID?.toString() ?? "",
  );

  const forkChain = chains.find(
    (chain) => chain.id.toString() === tenderlyForkChainId,
  );

  const handleTenderlyFork = () => {
    if (IS_TENDERLY_FORK) {
      lsService.removeItem(0, "tenderlyForkRpc");
      lsService.removeItem(0, "tenderlyForkChainId");
    } else {
      lsService.setItem(0, "tenderlyForkRpc", tenderlyForkRpc);
      lsService.setItem(0, "tenderlyForkChainId", +tenderlyForkChainId);
    }
    window.location.reload();
  };
  return (
    <div className="space-y-4 border border-grey3inverse p-4">
      <div className="flex flex-col gap-2">
        <p>Tenderly chain:</p>
        <Select
          value={tenderlyForkChainId}
          onValueChange={(value) => setTenderlyForkChainId(value)}
          disabled={IS_TENDERLY_FORK}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select fork chain id">
              {forkChain?.name ?? "Error"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {chains.map((chain) => (
              <SelectItem key={chain.id} value={chain.id.toString()}>
                {chain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <p>Tenderly RPC:</p>
        <Input
          type="text"
          value={tenderlyForkRpc}
          onChange={(e) => setTenderlyForkRpc(e.target.value)}
          placeholder="https://rpc.tenderly.co/fork/..."
          disabled={IS_TENDERLY_FORK}
        />
      </div>
      <Button onClick={handleTenderlyFork}>
        {IS_TENDERLY_FORK ? "Reset" : "Set"}
      </Button>
    </div>
  );
};
