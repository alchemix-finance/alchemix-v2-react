import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";
import { useAccount } from "wagmi";
import { QueryKeys } from "./queriesSchema";

const SNAPSHOT_HUB_URL = "https://hub.snapshot.org/graphql/";
const SNAPSHOT_SUBGRAPH_URL = "https://subgrapher.snapshot.org/delegation/1";

const VOTES_FOR_ADDRESS = gql`
  query votesForAddress($userAddress: String!) {
    votes(
      first: 100
      skip: 0
      where: { voter: $userAddress, space: "alchemixstakers.eth" }
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
`;

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
  type: string;
  discussion: string;
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

export const useUserDelegations = () => {
  const { address } = useAccount();
  return useQuery({
    queryKey: [QueryKeys.Delegate, address],
    queryFn: async () => {
      if (!address) throw new Error("Not connected");

      const queryFrom = gql`
        query userDelegations($userAddress: String!) {
          delegations(
            where: {
              space_in: ["alchemixstakers.eth"]
              delegator: $userAddress
            }
          ) {
            delegate
          }
        }
      `;

      const queryTo = gql`
        query userDelegations($userAddress: String!) {
          delegations(
            where: { space_in: ["alchemixstakers.eth"], delegate: $userAddress }
          ) {
            delegator
          }
        }
      `;

      const responseFrom = await request<
        { delegations: { delegate: string }[] },
        { userAddress: string }
      >(SNAPSHOT_SUBGRAPH_URL, queryFrom, { userAddress: address });

      const responseTo = await request<
        {
          delegations: {
            delegator: string;
          }[];
        },
        {
          userAddress: string;
        }
      >(SNAPSHOT_SUBGRAPH_URL, queryTo, {
        userAddress: address,
      });

      return {
        delegating: responseFrom.delegations,
        delegations: responseTo.delegations,
      };
    },
    enabled: !!address,
  });
};
