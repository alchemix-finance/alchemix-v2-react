import { mainnet, arbitrum, optimism } from "viem/chains";

export const HARVESTS_ENDPOINTS = {
  [mainnet.id]: `https://gateway.thegraph.com/api/${import.meta.env.VITE_SUBGRAPH_API_KEY}/subgraphs/id/FQHEgGziETEqw7oV32wLvFGCPthqj5YDMm7jhVtLn5PJ`,
  [arbitrum.id]: `https://gateway.thegraph.com/api/${import.meta.env.VITE_SUBGRAPH_API_KEY}/subgraphs/id/Dgjyhh69XooHPd4JjvT3ik9FaGAR3w7sUSQyQ1YDakGp`,
  [optimism.id]: `https://gateway.thegraph.com/api/${import.meta.env.VITE_SUBGRAPH_API_KEY}/subgraphs/id/GYBJ8wsQFkSwcgCqhaxnz5RU2VbgedAkWUk2qx9gTnzr`,
};

export const EARNED_ENDPOINTS = {
  [mainnet.id]: `https://gateway.thegraph.com/api/${import.meta.env.VITE_SUBGRAPH_API_KEY}/subgraphs/id/F4UjfsyCGtfpF3WBn8gqUBVg7q1BcfRPdaeAWXiVAuRb`,
  [arbitrum.id]: `https://gateway.thegraph.com/api/${import.meta.env.VITE_SUBGRAPH_API_KEY}/subgraphs/id/83fCRpYFopqq1B148ryjNeLZFBskYmJpFk1Ghcx1MdPY`,
  [optimism.id]: `https://gateway.thegraph.com/api/${import.meta.env.VITE_SUBGRAPH_API_KEY}/subgraphs/id/G8F6o2XwyjyHCyJkBCPMXXgkeaWdHoSoCJkhhGJUr8cQ`,
};
