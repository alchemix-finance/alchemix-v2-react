import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  IS_TENDERLY_FORK,
  tenderlySetBalance,
  tenderlySetErc20Balance,
} from "@/lib/wagmi/tenderly";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useTokensQuery } from "@/lib/queries/useTokensQuery";
import { useMutation } from "@tanstack/react-query";
import { useAccount, usePublicClient } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi/wagmiConfig";
import { isAddress, parseEther, parseUnits, toHex } from "viem";
import { GAS_ADDRESS } from "@/lib/constants";
import { isInputZero } from "@/utils/inputNotZero";

export const DebugTokens = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient<typeof wagmiConfig>();

  const { data: tokens } = useTokensQuery();

  const [amount, setAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const selectedToken = tokens?.find(
    (t) => t.address.toLowerCase() === tokenAddress.toLowerCase(),
  );

  const { mutate: setGasBalance } = useMutation({
    mutationFn: async () => {
      if (!address) return;
      if (isInputZero(amount)) return;
      await tenderlySetBalance({
        client: publicClient,
        params: [[address], toHex(parseEther(amount))],
      });
    },
  });

  const { mutate: setTokenBalance } = useMutation({
    mutationFn: async () => {
      if (isInputZero(amount)) return;
      if (!address) return;
      if (!isAddress(tokenAddress)) return;
      await tenderlySetErc20Balance({
        client: publicClient,
        params: [
          tokenAddress,
          address,
          toHex(parseUnits(amount, selectedToken?.decimals ?? 18)),
        ],
      });
    },
  });

  const onRetire = () => {
    if (tokenAddress === GAS_ADDRESS) {
      setGasBalance();
      return;
    }
    setTokenBalance();
  };

  return (
    <div className="space-y-4 border border-grey3inverse p-4">
      <div className="flex flex-col gap-2">
        <p>Alchemix tokens:</p>
        <Select
          value={tokenAddress}
          onValueChange={(value) => setTokenAddress(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select token">
              {selectedToken?.symbol ?? "Using custom"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tokens?.map((token) => (
              <SelectItem key={token.address} value={token.address}>
                {token.symbol}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <p>Custom token:</p>
        <Input
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>
      <div className="flex flex-col gap-2">
        <p>Amount:</p>
        <Input
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="10000"
        />
      </div>
      <Button disabled={!IS_TENDERLY_FORK} onClick={onRetire}>
        {IS_TENDERLY_FORK ? "Retire" : "Tenderly fork not set"}
      </Button>
    </div>
  );
};
