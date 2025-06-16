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

  const toggleAlchemistUnderlyingToken = ({
    address,
    alchemist,
    enabled,
  }: {
    address: `0x${string}`;
    alchemist: `0x${string}`;
    enabled: boolean;
  }) => {
    writeContract({
      address: alchemist,
      abi: alchemistV2Abi,
      chainId: chain.id,
      functionName: "setUnderlyingTokenEnabled",
      args: [address, !enabled],
    });
  };

  return (
    <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 relative rounded-sm border">
      <div className="bg-grey10inverse dark:bg-grey10 px-6 py-4">
        <h5 className="text-sm">Alchemix Control Panel</h5>
      </div>
      {isPending && <LoadingBar />}
      {!isPending && isSentinel && (
        <div className="space-y-4 p-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="alTokens" className="border-b-0">
              <AccordionTrigger className="bg-grey10inverse dark:bg-grey10 px-6 py-4">
                <h5 className="text-sm">Alchemists</h5>
              </AccordionTrigger>
              <AccordionContent className="p-2">
                {!!alTokens &&
                  alTokens.map((alToken) => (
                    <div
                      key={alToken.address}
                      className="flex items-center justify-between rounded-sm p-2"
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
                        className="border-red1 bg-red5 hover:bg-red3 rounded-sm border px-4 py-2 transition-all"
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
            <AccordionItem
              value="enabled-underlying-tokens"
              className="border-b-0"
            >
              <AccordionTrigger className="bg-grey10inverse dark:bg-grey10 px-6 py-4">
                <h5 className="text-sm">
                  Enabled Underlying Alchemists Tokens
                </h5>
              </AccordionTrigger>
              <AccordionContent className="p-2">
                {alchemists?.map((alchemist) => (
                  <div
                    key={alchemist.address}
                    className="space-y-2 rounded-sm p-2"
                  >
                    <h5 className="text-lg">Alchemist {alchemist.synthType}</h5>
                    {alchemist.underlyingTokens.map((token) => (
                      <div
                        key={token.address}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <a
                            className="font-alcxMono text-lg hover:underline"
                            href={`${chain.blockExplorers.default.url}/address/${token.address}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {token.address}
                          </a>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-sm">Status</p>
                          <p>
                            {!token.underlyingTokenParams.enabled ? (
                              <span className="text-red3">Paused</span>
                            ) : (
                              <span className="text-green1">Active</span>
                            )}
                          </p>
                        </div>
                        <button
                          className="border-red1 bg-red5 hover:bg-red3 rounded-sm border px-4 py-2 transition-all"
                          onClick={() =>
                            toggleAlchemistUnderlyingToken({
                              enabled: token.underlyingTokenParams.enabled,
                              address: token.address,
                              alchemist: token.alchemist.address,
                            })
                          }
                        >
                          {token.underlyingTokenParams.enabled
                            ? "Pause"
                            : "Unpause"}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="transmuters" className="border-b-0">
              <AccordionTrigger className="bg-grey10inverse dark:bg-grey10 px-6 py-4">
                <h5 className="text-sm">Transmuters</h5>
              </AccordionTrigger>
              <AccordionContent className="p-2">
                {transmutersWithTokenLabel &&
                  transmutersWithTokenLabel.map((transmuter) => (
                    <div
                      key={transmuter.address}
                      className="flex items-center justify-between rounded-sm p-2"
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
                        className="border-red1 bg-red5 hover:bg-red3 rounded-sm border px-4 py-2 transition-all"
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
              <AccordionTrigger className="bg-grey10inverse dark:bg-grey10 px-6 py-4">
                <h5 className="text-sm">Vaults</h5>
              </AccordionTrigger>
              <AccordionContent className="p-2">
                {filteredVaults &&
                  filteredVaults.map((vault) => (
                    <div
                      key={vault.address}
                      className="flex items-center justify-between rounded-sm p-2"
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
                        className="border-red1 bg-red5 hover:bg-red3 rounded-sm border px-4 py-2 transition-all"
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
