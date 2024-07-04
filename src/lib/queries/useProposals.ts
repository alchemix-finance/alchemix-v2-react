import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { useAccount } from "wagmi";
import { QueryKeys } from "./queriesSchema";

const SNAPSHOT_HUB_URL = "https://hub.snapshot.org/graphql/";
const SNAPSHOT_SUBGRAPH_URL =
  "https://api.thegraph.com/subgraphs/name/snapshot-labs/snapshot";

const VOTES_FOR_ADDRESS = gql`
    query votesForAddress($userAddress: String!) {
        {
            votes (
              first: 100
              skip: 0
              where: {
                voter: $userAddress,
                space: alchemixstakers.eth
              }
            ) {
              id
              voter
              created
              choice
              proposal {
                id
              }
            }
          }
        }`;

interface Vote {
  id: string;
  voter: string;
  created: string;
  choice: string;
  proposal: {
    id: string;
  };
}

const PROPOSALS = gql`
  {
    proposals(
      skip: 0
      where: { space_in: ["alchemixstakers.eth"] }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
      ipfs
      title
      body
      choices
      scores
      scores_total
      start
      end
      snapshot
      state
      author
      discussion
      type
    }
  }
`;

interface Proposal {
  id: string;
  ipfs: string;
  title: string;
  body: string;
  choices: string[];
  scores: string[];
  scores_total: string;
  start: string;
  end: string;
  snapshot: string;
  state: string;
}

const ACTIVE_PROPOSALS = gql`
  {
    proposals(
      skip: 0
      where: { space_in: ["alchemixstakers.eth"], state: "active" }
      orderBy: "created"
      orderDirection: desc
    ) {
      id
    }
  }
`;

interface ActiveProposal {
  id: string;
}

export const useVotesForAddress = () => {
  const { address } = useAccount();
  return useQuery({
    queryKey: [QueryKeys.VotesForAddress, address],
    queryFn: async () => {
      if (!address) throw new Error("Not connected");
      const { votes } = await request<
        {
          votes: Vote[];
        },
        {
          userAddress: string;
        }
      >(SNAPSHOT_HUB_URL, VOTES_FOR_ADDRESS, {
        userAddress: address,
      });
      return votes;
    },
    enabled: !!address,
  });
};

export const useProposals = () => {
  return useQuery({
    queryKey: [QueryKeys.Proposals],
    queryFn: async () => {
      const response = await request<{ proposals: Proposal[] }>(
        SNAPSHOT_HUB_URL,
        PROPOSALS,
      );
      return response.proposals;
    },
  });
};

export const useActiveProposals = () => {
  return useQuery({
    queryKey: [QueryKeys.ActiveProposals],
    queryFn: async () => {
      const response = await request<{ proposals: ActiveProposal[] }>(
        SNAPSHOT_HUB_URL,
        ACTIVE_PROPOSALS,
      );
      return response.proposals;
    },
  });
};

const querySetup = {
  from: ["delegator", "delegate"],
  to: ["delegate", "delegator"],
};

export const useUserDelegations = (direction: "from" | "to") => {
  const { address } = useAccount();
  return useQuery({
    queryKey: [QueryKeys.Delegate, address, direction],
    queryFn: async () => {
      if (!address) throw new Error("Not connected");

      const query = gql`
        query userDelegations($userAddress: String!) {
          delegations(where: { space_in: ["alchemixstakers.eth"], ${querySetup[direction][0]}: $userAddress }) {
            ${querySetup[direction][1]}
          }
        }
      `;

      const response = await request<
        {
          delegations:
            | {
                delegator: string;
              }
            | {
                delegate: string;
              };
        },
        {
          userAddress: string;
        }
      >(SNAPSHOT_SUBGRAPH_URL, query, {
        userAddress: address,
      });

      return response.delegations;
    },
    enabled: !!address,
  });
};
