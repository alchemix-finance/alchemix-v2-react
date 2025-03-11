import { getAddress } from "viem";
import { Fragment, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { toast } from "sonner";
import {
  BadgeCheckIcon,
  ExternalLinkIcon,
  MessagesSquareIcon,
} from "lucide-react";
import Dompurify from "dompurify";

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
import { Button } from "@/components/ui/button";
import { dayjs } from "@/lib/dayjs";
import { useVotesForAddress } from "@/lib/queries/useProposals";
import { Proposal } from "@/lib/types";
import { cn } from "@/utils/cn";
import { useChain } from "@/hooks/useChain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QueryKeys } from "@/lib/queries/queriesSchema";
import { windowOpen } from "@/utils/windowOpen";
import { formatNumber } from "@/utils/number";
import SnapshotIcon from "@/assets/logos/snapshot.svg?react";

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
  windowOpen(`https://snapshot.org/#/alchemixstakers.eth/proposal/${id}`);
};

const openOnForum = (discussion: string) => {
  windowOpen(discussion);
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

  const { mutate: writeVote, isPending } = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Not connected.");
      if (!walletClient) throw new Error("No wallet.");

      const message = {
        choice: proposal.choices.indexOf(selectedChoice) + 1,
        proposal: proposal.id,
        app: "alchemix",
        space: "alchemixstakers.eth",
        type: proposal.type,
        metadata: "{}",
        reason: "",
      };

      const type2 = message.proposal.startsWith("0x");
      const types = type2
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

      const checksumAddress = getAddress(address);

      const data = {
        types,
        domain: {
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

      const envelop = { address: checksumAddress, sig: signature, data };

      const submitAddress = "https://seq.snapshot.org";

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
      <AccordionTrigger className="border-grey3inverse bg-grey10inverse dark:border-grey3 dark:bg-grey10 rounded-sm border px-8 py-4 data-[state=open]:rounded-b-none data-[state=open]:border-b-0">
        <div className="flex w-full flex-col gap-4">
          <div className="flex space-x-4">
            <BadgeCheckIcon
              className={cn("h-6 w-6", vote ? "text-green4" : "text-[#979BA2]")}
            />
            <p
              className={cn(
                proposal.state === "closed" ? "opacity-50" : "opacity-100",
              )}
            >
              {proposal.title}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:flex-nowrap lg:gap-0">
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-lightgrey10 text-center text-sm">Status</p>
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
                    "text-center",
                    proposal.state === "closed" ? "opacity-50" : "opacity-100",
                  )}
                >
                  {proposal.state}
                </p>
              </div>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-lightgrey10 text-center text-sm">Type</p>
              <p
                className={cn(
                  "text-center",
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
              >
                {votingTypeMapping[proposal.type]}
              </p>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-lightgrey10 text-center text-sm">Start</p>
              <p
                className={cn(
                  "text-center",
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
              >
                {dayjs(+proposal.start * 1000).format("MMM D, YYYY")}
              </p>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-lightgrey10 text-center text-sm">End</p>
              <p
                className={cn(
                  "text-center",
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
              >
                {dayjs(+proposal.end * 1000).format("MMM D, YYYY")}
              </p>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-lightgrey10 text-center text-sm">Snapshot</p>
              <a
                className={cn(
                  "text-center underline hover:no-underline",
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
                href={`https://etherscan.io/block/${proposal.snapshot}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                {proposal.snapshot}
                <ExternalLinkIcon className="ml-2 inline h-4 w-4" />
              </a>
            </div>
            <div className="flex w-full flex-1 flex-col items-start lg:items-center">
              <p className="text-lightgrey10 text-center text-sm">IPFS</p>
              <a
                href={`https://cloudflare-ipfs.com/ipfs/${proposal.ipfs}`}
                target="_blank"
                rel="noreferrer noopener"
                className={cn(
                  "text-center underline hover:no-underline",
                  proposal.state === "closed" ? "opacity-50" : "opacity-100",
                )}
              >
                {proposal.ipfs.slice(0, 8)}
                <ExternalLinkIcon className="ml-2 inline h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="border-grey3inverse bg-grey10inverse dark:border-grey3 dark:bg-grey10 flex flex-col gap-4 rounded-sm rounded-t-none border border-t-0 px-4">
        <div className="border-grey3inverse bg-grey15inverse dark:border-grey3 dark:bg-grey15 rounded-sm border p-4">
          <p className="mb-3 text-sm opacity-50">Description</p>
          <div
            className="w-full max-w-[calc(100vw-10rem)] overflow-x-auto text-justify whitespace-pre-wrap lg:max-w-[calc(100vw-32rem)]"
            dangerouslySetInnerHTML={{
              __html: Dompurify.sanitize(proposal.body),
            }}
          ></div>
        </div>
        <div className="border-grey3inverse bg-grey15inverse dark:border-grey3 dark:bg-grey15 flex min-w-max flex-col rounded-sm border p-4">
          <p className="mb-3 opacity-50">Your vote</p>
          <div id="selection" className="mb-6 w-auto space-y-1">
            {proposal.state !== "closed" && !isSupported && (
              <p>This voting type is not yet supported.</p>
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
                <Button
                  variant="outline"
                  onClick={onVote}
                  disabled={!isSupported || !!vote || isPending}
                >
                  {isPending
                    ? "Casting Vote"
                    : !isSupported
                      ? "Unsupported"
                      : vote
                        ? "Already Voted"
                        : "Cast Vote"}
                </Button>
              )}
              {proposal.state === "closed" && (
                <Button
                  variant="destructive"
                  disabled={proposal.state === "closed"}
                >
                  Vote closed
                </Button>
              )}
              {!!proposal.discussion && (
                <Button
                  variant="action"
                  weight="normal"
                  className="border-grey5inverse text-white2inverse/80 dark:text-white2/80 hover:text-white2inverse dark:hover:text-white2 dark:border-grey5"
                  onClick={() => openOnForum(proposal.discussion)}
                >
                  <MessagesSquareIcon className="h-5 w-5" />
                  <p className="ml-4">View Discussion</p>
                </Button>
              )}
              <Button
                variant="action"
                weight="normal"
                className="border-grey5inverse text-white2inverse/80 dark:text-white2/80 hover:text-white2inverse dark:hover:text-white2 dark:border-grey5"
                onClick={() => openOnSnapshot(proposal.id)}
              >
                <SnapshotIcon className="h-5 w-5" />
                <p className="ml-4">Open on Snapshot</p>
              </Button>
            </div>
          </div>

          <p className="mb-3 opacity-50">Results</p>
          {proposal.choices.map((choice, i) => (
            <Fragment key={choice + i}>
              <div className="mb-2">
                <p>{choice}</p>
                <p className="text-sm">
                  {formatNumber(proposal.scores?.[i])} ALCX{" "}
                  {formatNumber(
                    (100 / +proposal.scores_total) * +proposal.scores?.[i],
                  )}
                  %
                </p>
              </div>
              <div className="mb-4 text-center">
                <div className="relative pt-1">
                  <div className="flex h-2 overflow-hidden rounded-sm text-xs">
                    <div
                      style={{
                        width: `${
                          (
                            (100 / +proposal.scores_total) *
                            +proposal.scores?.[i]
                          ).toFixed(2) || 0
                        }%`,
                      }}
                      className="bg-bronze1 flex flex-col justify-center text-center whitespace-nowrap text-white shadow-none"
                    ></div>
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
