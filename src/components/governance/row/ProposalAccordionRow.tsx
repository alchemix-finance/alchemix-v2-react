import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { dayjs } from "@/lib/dayjs";
import { useVotesForAddress } from "@/lib/queries/useProposals";
import { Proposal } from "@/lib/types";
import { cn } from "@/utils/cn";
import { useMemo, useState } from "react";
import { useChain } from "@/hooks/useChain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { getAddress } from "viem";

const votingTypeMapping: Record<string, string> = {
  "single-choice": "Single Choice",
  approval: "Approval Voting",
  quadratic: "Quadratic Voting",
  "ranked-choice": "Ranked Choice",
  weighted: "Weighted Voting",
  basic: "Basic Voting",
};

const supportedTypes = ["basic", "single-choice"];

const openOnSnapshot = (id: string) => {
  window.open(
    `https://snapshot.org/#/alchemixstakers.eth/proposal/${id}`,
    "_blank",
  );
};

const openOnForum = (discussion: string) => {
  window.open(discussion, "_blank");
};

export const ProposalsAccordionRow = ({ proposal }: { proposal: Proposal }) => {
  const chain = useChain();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient({
    chainId: chain.id,
  });

  const { address } = useAccount();

  const [selectedChoice, setSelectedChoice] = useState("");

  const { data: votes } = useVotesForAddress();
  const vote = votes?.find((vote) => vote.proposal.id === proposal.id);

  const isSupported = supportedTypes.indexOf(proposal.type) !== -1;

  const message = useMemo(() => {
    return {
      app: "alchemix",
      proposal: proposal.id,
      choice: selectedChoice,
      space: "alchemixstakers",
      type: proposal.type,
      metadata: "{}",
      reason: "",
    };
  }, [proposal, selectedChoice]);

  const voteTypes = useMemo(() => {
    const type2 = message.proposal.startsWith("0x");
    const type = type2
      ? {
          Vote: [
            { name: "from", type: "address" },
            { name: "space", type: "string" },
            { name: "timestamp", type: "uint64" },
            { name: "proposal", type: "bytes32" },
            { name: "choice", type: "uint32" },
            { name: "reason", type: "string" },
            { name: "app", type: "string" },
            { name: "metadata", type: "string" },
          ],
        }
      : {
          Vote: [
            { name: "from", type: "address" },
            { name: "space", type: "string" },
            { name: "timestamp", type: "uint64" },
            { name: "proposal", type: "string" },
            { name: "choice", type: "uint32" },
            { name: "reason", type: "string" },
            { name: "app", type: "string" },
            { name: "metadata", type: "string" },
          ],
        };
    return type;
  }, [message.proposal]);

  const { mutate: writeVote } = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Not connected.");
      if (!walletClient) throw new Error("No wallet.");

      const checksumAddress = getAddress(address);

      const data = {
        types: voteTypes,
        domain: {
          chainId: chain.id,
          name: "snapshot",
          version: "0.1.4",
        },
        message: {
          ...message,
          from: checksumAddress,
          timestamp: parseInt((Date.now() / 1e3).toFixed()),
        },
      };

      const signature = await walletClient.signTypedData({
        account: checksumAddress,
        primaryType: "Vote",
        ...data,
      });

      const envelop = { address: checksumAddress, signature, data };

      const submitAddress = "https://hub.snapshot.org/";

      const init = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(envelop),
      };

      return new Promise((resolve, reject) => {
        fetch(submitAddress, init)
          .then((res) => {
            if (res.ok) return resolve(res.json());
            if (res.headers.get("content-type")?.includes("application/json"))
              return res.json().then(reject).catch(reject);
            throw res;
          })
          .catch(reject);
      });
    },
    onError: (error) =>
      toast.error("Error voting", {
        description: error.message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.VotesForAddress],
      });
      toast.success("Vote casted");
    },
  });

  const onVote = () => {
    writeVote();
  };

  return (
    <AccordionItem value={proposal.id}>
      <AccordionTrigger className="rounded border border-grey3inverse bg-grey10inverse px-8 py-4 hover:cursor-pointer hover:no-underline">
        <div className="flex flex-col gap-4">
          <div className="flex w-full flex-row space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke={vote ? "#42B792" : "#979BA2"}
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
              ></path>
            </svg>
            <p
              className={cn(
                proposal.state === "closed" ? "opacity-50" : "opacity-100",
              )}
            >
              {proposal.title}
            </p>
          </div>
          <div className="flex w-full flex-row flex-wrap gap-2 lg:flex-nowrap lg:gap-0">
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-center text-sm text-lightgrey10">Status</p>
              <div className="flex flex-row space-x-2">
                <div
                  className={cn(
                    "h-2 w-2 self-center rounded-full",
                    proposal.state === "closed"
                      ? "bg-red3 opacity-75"
                      : "bg-green4",
                  )}
                ></div>
                <p
                  className={cn(
                    "capitalize",
                    proposal.state === "closed" ? "opacity-50" : "opacity-100",
                  )}
                >
                  {proposal.state}
                </p>
              </div>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-center text-sm text-lightgrey10">Type</p>
              <p
                className={cn(
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
              >
                {votingTypeMapping[proposal.type]}
              </p>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-center text-sm text-lightgrey10">Start</p>
              <p
                className={cn(
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
              >
                {dayjs(+proposal.start * 1000).format("MMM D, YYYY")}
              </p>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-center text-sm text-lightgrey10">End</p>
              <p
                className={cn(
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
              >
                {dayjs(+proposal.end * 1000).format("MMM D, YYYY")}
              </p>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-center text-sm text-lightgrey10">Snapshot</p>
              <a
                className={cn(
                  buttonVariants({
                    variant: "link",
                  }),
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
                href={`https://etherscan.io/block/${proposal.snapshot}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {proposal.snapshot}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
              </a>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-center text-sm text-lightgrey10">IPFS</p>
              <a
                href={`https://cloudflare-ipfs.com/ipfs/${proposal.ipfs}`}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(
                  buttonVariants({
                    variant: "link",
                  }),
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
              >
                {proposal.ipfs.slice(0, 8)}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="flex flex-col gap-4 overflow-x-scroll lg:flex-row">
        <div className="rounded border border-grey3inverse bg-grey15inverse p-4">
          <p className="mb-3 text-sm opacity-50">Description</p>
          <div
            className="w-full whitespace-pre-wrap text-justify"
            dangerouslySetInnerHTML={{ __html: proposal.body }}
          ></div>
        </div>
        <div className="flex min-w-max flex-col rounded border border-grey3inverse bg-grey15inverse p-4">
          <p className="mb-3 opacity-50">Your vote</p>
          <div id="selection" className="mb-6 w-auto">
            {proposal.state !== "closed" && !isSupported && (
              <p>Unsupported explain</p>
            )}
            {proposal.state !== "closed" && !vote && (
              <Select
                value={selectedChoice}
                onValueChange={(value) => setSelectedChoice(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select your choice">
                    {selectedChoice}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {proposal.choices.map((choice) => (
                    <SelectItem key={choice} value={choice}>
                      {choice}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <div className="flex flex-col space-y-3">
              {proposal.state !== "closed" && (
                <Button onClick={onVote} disabled={!isSupported || !!vote}>
                  {!isSupported
                    ? "Unsupported"
                    : vote
                      ? "Already Voted"
                      : "Cast Vote"}
                </Button>
              )}
              {proposal.state === "closed" && (
                <Button disabled={proposal.state === "closed"}>
                  Vote closed
                </Button>
              )}
              {!!proposal.discussion && (
                <Button
                  variant="link"
                  onClick={() => openOnForum(proposal.discussion)}
                >
                  Open Discussion
                </Button>
              )}
              <Button
                variant="link"
                onClick={() => openOnSnapshot(proposal.id)}
              >
                Open on Snapshot
              </Button>
            </div>
          </div>

          <p className="mb-3 opacity-50">Results</p>
          {proposal.choices.map((choice, i) => (
            <>
              <div className="wrapper mb-2">
                <p>{choice}</p>
                <p className="text-sm">
                  {proposal.scores?.[i] || "0"} ALCX{" "}
                  {(
                    (100 / +proposal.scores_total) *
                    +proposal.scores?.[i]
                  )?.toFixed(2) || "0"}
                  %
                </p>
              </div>
              <div className="mb-4 text-center">
                <div className="relative pt-1">
                  <div className="flex h-2 overflow-hidden rounded text-xs">
                    <div
                      style={{
                        width: `${
                          (
                            (100 / +proposal.scores_total) *
                            +proposal.scores?.[i]
                          ).toFixed(2) || 0
                        }%`,
                      }}
                      className="flex flex-col justify-center whitespace-nowrap bg-bronze1 text-center text-white shadow-none"
                    ></div>
                  </div>
                </div>
              </div>
            </>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
