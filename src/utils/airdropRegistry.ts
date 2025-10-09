import { MerkleDistributorArtifacts, DeploymentAddresses } from '@/lib/types';

// Airdrop registry to manage multiple airdrop campaigns
export interface AirdropCampaign {
  id: string;
  name: string;
  description: string;
  merkleRoot: string;
  tokenAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  distributorAddress: string;
  chainId: number;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

// Current active airdrop campaigns
export const AIRDROP_REGISTRY: Record<string, AirdropCampaign> = {
  '': {  // Use empty string as ID since files are at /airdrop/ root
    id: '',
    name: 'jUSDC Recompensation',
    description: 'USDC token distribution via MerkleDistributor',
    merkleRoot: '0xfe3eaa2ebc95adfc15f8625e63b500e1f3f83b8f5fd522aaada7332fee12f2e3',
    tokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    tokenSymbol: 'USDC',
    tokenDecimals: 6,
    distributorAddress: '0xcc0C79175b369a6300CA9130E38a158E0b1b3175',
    chainId: 42161,
    startDate: '2024-01-01',
    isActive: true,
  },
};

// Helper function to get active airdrop campaigns for a specific chain
export const getActiveAirdropsForChain = (chainId: number): AirdropCampaign[] => {
  return Object.values(AIRDROP_REGISTRY).filter(
    (campaign) => campaign.isActive && campaign.chainId === chainId
  );
};

// Helper function to check if an address is eligible for any airdrop
export const checkAddressEligibility = async (
  address: string,
  chainId: number
): Promise<AirdropCampaign[]> => {
  const activeCampaigns = getActiveAirdropsForChain(chainId);

  const eligibleCampaigns: AirdropCampaign[] = [];

  for (const campaign of activeCampaigns) {
    try {
      // Fetch merkle data for this campaign
      const response = await fetch(`/airdrop/${campaign.id}/merkle.json`);
      if (response.ok) {
        const merkleData: MerkleDistributorArtifacts = await response.json();

        // Check if address has a claim in this campaign
        if (merkleData.claims[address]) {
          eligibleCampaigns.push(campaign);
        }
      }
    } catch (error) {
      console.warn(`Failed to check eligibility for campaign ${campaign.id}:`, error);
    }
  }

  return eligibleCampaigns;
};

// Helper function to get merkle data for a specific campaign
export const getMerkleDataForCampaign = async (
  campaignId: string
): Promise<MerkleDistributorArtifacts | null> => {
  try {
    // Use root path since campaignId is empty string
    const response = await fetch('/airdrop/merkle.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn(`Failed to load merkle data for campaign ${campaignId}:`, error);
  }
  return null;
};

// Helper function to get deployment addresses for a specific campaign
export const getDeploymentAddressesForCampaign = async (
  campaignId: string
): Promise<DeploymentAddresses | null> => {
  try {
    // Use root path since campaignId is empty string
    const response = await fetch('/airdrop/addresses.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn(`Failed to load addresses for campaign ${campaignId}:`, error);
  }
  return null;
};
