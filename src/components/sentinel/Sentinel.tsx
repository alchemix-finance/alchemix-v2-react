import { useSentinel } from "@/lib/queries/sentinel/useSentinel";
import { LoadingBar } from "../common/LoadingBar";
import { useAlchemists } from "@/lib/queries/useAlchemists";
import {
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useEffect } from "react";
import { alTokenAbi } from "@/abi/alToken";
import { useTransmuters } from "@/lib/queries/transmuters/useTransmuters";
import { useVaults } from "@/lib/queries/vaults/useVaults";
import { IGNORED_VAULTS } from "@/lib/config/vaults";
import { useChain } from "@/hooks/useChain";
import { useWriteContractMutationCallback } from "@/hooks/useWriteContractMutationCallback";
import { transmuterV2Abi } from "@/abi/transmuterV2";
import { alchemistV2Abi } from "@/abi/alchemistV2";
import { useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import {
  AccordionTrigger,
  Accordion,
  AccordionItem,
  AccordionContent,
} from "../ui/accordion";

export const Sentinel = () => {
  const chain = useChain();
  const queryClient = useQueryClient();
  const mutationCallback = useWriteContractMutationCallback();

  const { data: isSentinel, isPending: isPendingSentinel } = useSentinel();

  const { data: alchemists } = useAlchemists();
  const {
    data: pausedDatas,
    isPending: isPendingPaused,
    queryKey: pausedQueryKey,
  } = useReadContracts({
    allowFailure: false,
    contracts: alchemists?.map(
      ({ debtToken }) =>
        ({
          address: debtToken,
          abi: alTokenAbi,
          chainId: chain.id,
          functionName: "paused",
          args: [debtToken],
        }) as const,
    ),
    query: {
      enabled: !!alchemists,
    },
  });
  const alTokens = alchemists
    ? pausedDatas?.map((paused, i) => ({
        paused,
        address: alchemists[i].debtToken,
        label: alchemists[i].synthType,
        alchemist: alchemists[i].address,
      }))
    : [];

  const { data: vaults, isPending: isPendingVaults } = useVaults();
  const filteredVaults = vaults?.filter(
    (vault) => !IGNORED_VAULTS.includes(vault.address),
  );

  const { data: transmuters, isPending: isPendingTransmuters } =
    useTransmuters();
  const transmutersWithTokenLabel = transmuters?.map((transmuter) => {
    const vault = vaults?.find(
      (vault) =>
        vault.underlyingToken.toLowerCase() ===
        transmuter.underlyingToken.toLowerCase(),
    );
    return {
      ...transmuter,
      tokenLabel: vault?.metadata.underlyingSymbol,
    };
  });

  const isPending =
    isPendingSentinel ||
    isPendingPaused ||
    isPendingVaults ||
    isPendingTransmuters;

  const {
    writeContract,
    data: hash,
    reset: resetSentinelTx,
  } = useWriteContract({
    mutation: mutationCallback({
      action: "Sentinel",
    }),
  });

  const { data: receipt } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (receipt) {
      queryClient.invalidateQueries({
        queryKey: pausedQueryKey,
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Transmuters],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.Vaults],
      });
      resetSentinelTx();
    }
  }, [pausedQueryKey, queryClient, receipt, resetSentinelTx]);

  const toggleAlTokenState = ({
    address,
    alchemist,
    pause,
  }: {
    address: `0x${string}`;
    alchemist: `0x${string}`;
    pause: boolean;
  }) => {
    writeContract({
      address,
      abi: alTokenAbi,
      chainId: chain.id,
      functionName: "pauseAlchemist",
      args: [alchemist, pause],
    });
  };

  const toggleTransmuterState = ({
    address,
    pause,
  }: {
    address: `0x${string}`;
    pause: boolean;
  }) => {
    writeContract({
      address,
      abi: transmuterV2Abi,
      chainId: chain.id,
      functionName: "setPause",
      args: [pause],
    });
  };

  const toggleVaultState = ({
    yieldToken,
    alchemist,
    unpause,
  }: {
    yieldToken: `0x${string}`;
    alchemist: `0x${string}`;
    unpause: boolean;
  }) => {
    writeContract({
      address: alchemist,
      abi: alchemistV2Abi,
      chainId: chain.id,
      functionName: "setYieldTokenEnabled",
      args: [yieldToken, unpause],
    });
  };

  return (
    <div className="relative rounded border border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15">
      <div className="bg-grey10inverse px-6 py-4 dark:bg-grey10">
        <h5 className="text-sm">Alchemix Control Panel</h5>
      </div>
      {isPending && <LoadingBar />}
      {!isPending && isSentinel && (
        <div className="space-y-4 p-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="alTokens" className="border-b-0">
              <AccordionTrigger className="bg-grey10inverse px-6 py-4 dark:bg-grey10">
                <h5 className="text-sm">Alchemists</h5>
              </AccordionTrigger>
              <AccordionContent className="p-2">
                {!!alTokens &&
                  alTokens.map((alToken) => (
                    <div
                      key={alToken.address}
                      className="flex items-center justify-between rounded p-2"
                    >
                      <div className="flex flex-col">
                        <p className="text-sm">{alToken.label}</p>
                        <a
                          className="font-alcxMono text-lg hover:underline"
                          href={`${chain.blockExplorers.default.url}/address/${alToken.address}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {alToken.address}
                        </a>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm">Status</p>
                        <p>
                          {alToken.paused ? (
                            <span className="text-red3">Paused</span>
                          ) : (
                            <span className="text-green1">Active</span>
                          )}
                        </p>
                      </div>
                      <button
                        className="rounded border border-red1 bg-red5 px-4 py-2 transition-all hover:bg-red3"
                        onClick={() =>
                          toggleAlTokenState({
                            pause: !alToken.paused,
                            address: alToken.address,
                            alchemist: alToken.alchemist,
                          })
                        }
                      >
                        {alToken.paused ? "Unpause" : "Pause"}
                      </button>
                    </div>
                  ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="transmuters" className="border-b-0">
              <AccordionTrigger className="bg-grey10inverse px-6 py-4 dark:bg-grey10">
                <h5 className="text-sm">Transmuters</h5>
              </AccordionTrigger>
              <AccordionContent className="p-2">
                {transmutersWithTokenLabel &&
                  transmutersWithTokenLabel.map((transmuter) => (
                    <div
                      key={transmuter.address}
                      className="flex items-center justify-between rounded p-2"
                    >
                      <div className="flex flex-col">
                        <p className="text-sm">Token</p>
                        <p className="text-lg">{transmuter.tokenLabel}</p>
                      </div>
                      <div>
                        <p className="text-sm">Status</p>
                        <p>
                          {transmuter.isPaused ? (
                            <span className="text-red3">Paused</span>
                          ) : (
                            <span className="text-green1">Active</span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm">{transmuter.metadata.label}</p>
                        <a
                          className="font-alcxMono text-lg hover:underline"
                          href={`${chain.blockExplorers.default.url}/address/${transmuter.address}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {transmuter.address}
                        </a>
                      </div>
                      <button
                        className="rounded border border-red1 bg-red5 px-4 py-2 transition-all hover:bg-red3"
                        onClick={() =>
                          toggleTransmuterState({
                            pause: !transmuter.isPaused,
                            address: transmuter.address,
                          })
                        }
                      >
                        {transmuter.isPaused ? "Unpause" : "Pause"}
                      </button>
                    </div>
                  ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="vaults" className="border-b-0">
              <AccordionTrigger className="bg-grey10inverse px-6 py-4 dark:bg-grey10">
                <h5 className="text-sm">Vaults</h5>
              </AccordionTrigger>
              <AccordionContent className="p-2">
                {filteredVaults &&
                  filteredVaults.map((vault) => (
                    <div
                      key={vault.address}
                      className="flex items-center justify-between rounded p-2"
                    >
                      <div className="flex flex-col">
                        <p className="text-sm">Alchemist</p>
                        <p>{vault.alchemist.synthType}</p>
                      </div>
                      <div>
                        <p className="text-sm">Status</p>
                        <p>
                          {!vault.yieldTokenParams.enabled ? (
                            <span className="text-red3">Paused</span>
                          ) : (
                            <span className="text-green1">Active</span>
                          )}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm">{vault.metadata.label}</p>
                        <a
                          className="font-alcxMono text-lg hover:underline"
                          href={`${chain.blockExplorers.default.url}/address/${vault.address}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {vault.address}
                        </a>
                      </div>
                      <button
                        className="rounded border border-red1 bg-red5 px-4 py-2 transition-all hover:bg-red3"
                        onClick={() =>
                          toggleVaultState({
                            unpause: !vault.yieldTokenParams.enabled,
                            yieldToken: vault.yieldToken,
                            alchemist: vault.alchemist.address,
                          })
                        }
                      >
                        {vault.yieldTokenParams.enabled ? "Pause" : "Unpause"}
                      </button>
                    </div>
                  ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
      {!isPending && !isSentinel && <p>You are not the one.</p>}
    </div>
  );
};
