'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits } from 'viem';
import { distributorABI } from '@/abi/distributor';
import { MerkleDistributorArtifacts, DeploymentAddresses, Claim } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { getActiveAirdropsForChain, getMerkleDataForCampaign, getDeploymentAddressesForCampaign, AirdropCampaign } from '@/utils/airdropRegistry';

interface AirdropProps {
  className?: string;
  campaignId?: string; // Optional: specify a particular campaign, otherwise shows all available
}

export const Airdrop = ({ className, campaignId }: AirdropProps) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const [currentCampaign, setCurrentCampaign] = useState<AirdropCampaign | null>(null);
  const [artifacts, setArtifacts] = useState<MerkleDistributorArtifacts | null>(null);
  const [addresses, setAddresses] = useState<DeploymentAddresses | null>(null);
  const [userClaim, setUserClaim] = useState<Claim | null>(null);
  const [isClaimed, setIsClaimed] = useState<boolean>(false);
  const [contractError, setContractError] = useState<string | null>(null);

  const loadAvailableCampaigns = useCallback(async () => {
    const campaigns = getActiveAirdropsForChain(chainId);

    if (campaignId) {
      // If specific campaign requested, use only that one
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        setCurrentCampaign(campaign);
      }
    } else {
      // Otherwise show all available campaigns
      if (campaigns.length > 0) {
        setCurrentCampaign(campaigns[0]);
      }
    }
  }, [chainId, campaignId]);

  // Load available campaigns on component mount
  useEffect(() => {
    loadAvailableCampaigns();
  }, [loadAvailableCampaigns]);

  const loadCampaignData = useCallback(async (campaign: AirdropCampaign) => {
    try {
      const [merkleData, deploymentData] = await Promise.all([
        getMerkleDataForCampaign(campaign.id),
        getDeploymentAddressesForCampaign(campaign.id)
      ]);

      if (merkleData) {
        setArtifacts(merkleData);
      }

      if (deploymentData) {
        setAddresses(deploymentData);
      }
    } catch (error) {
      console.error(`Failed to load data for campaign ${campaign.id}:`, error);
    }
  }, []);

  // Load campaign data when campaign changes
  useEffect(() => {
    if (currentCampaign) {
      loadCampaignData(currentCampaign);
    }
  }, [currentCampaign, loadCampaignData]);

  const checkUserAllocation = useCallback(async () => {
    if (!artifacts || !address) return;

    const checksummedAddress = address; // wagmi already provides checksummed address
    const claim = artifacts.claims[checksummedAddress];

    if (claim) {
      setUserClaim(claim);
    } else {
      setUserClaim(null);
    }
  }, [artifacts, address]);

  // Check if user has allocation when wallet connects
  useEffect(() => {
    if (isConnected && address && artifacts) {
      checkUserAllocation();
    }
  }, [isConnected, address, artifacts, checkUserAllocation]);



  // Contract reads

  const { data: isClaimedData, refetch: refetchClaimStatus, error: claimStatusError } = useReadContract({
    address: addresses?.distributor as `0x${string}`,
    abi: distributorABI,
    functionName: 'isClaimed',
    args: userClaim ? [BigInt(userClaim.index)] : undefined,
    query: {
      enabled: !!addresses?.distributor && !!userClaim,
      retry: false,
    },
  });

  // Update claim status and handle errors
  useEffect(() => {
    if (isClaimedData !== undefined) {
      setIsClaimed(isClaimedData);
    }
    if (claimStatusError) {
      setContractError('Contract connection failed. Please refresh and try again.');
    } else {
      setContractError(null);
    }
  }, [isClaimedData, claimStatusError]);

  // Claim transaction
  const { writeContract: claimTokens, data: hash } = useWriteContract();

  const { isLoading: isClaiming, isSuccess: isClaimedSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleClaimSuccess = useCallback(() => {
    refetchClaimStatus();
  }, [refetchClaimStatus]);

  useEffect(() => {
    if (isClaimedSuccess) {
      handleClaimSuccess();
    }
  }, [isClaimedSuccess, handleClaimSuccess]);

  const handleClaim = async () => {
    if (!userClaim || !addresses?.distributor || !artifacts) return;

    try {
      claimTokens({
        address: addresses.distributor as `0x${string}`,
        abi: distributorABI,
        functionName: 'claim',
        args: [
          BigInt(userClaim.index),
          address!,
          BigInt(userClaim.amount),
          userClaim.proof as `0x${string}`[],
        ],
      });
    } catch (error) {
      console.error('Claim failed:', error);
      alert('Claim failed. Please try again.');
    }
  };

  const formatAmount = (amount: string, decimals: number = 6) => {
    return formatUnits(BigInt(amount), decimals);
  };

  const isWrongNetwork = chainId !== (currentCampaign?.chainId || 42161);

  // Only show if connected to correct network and user is eligible
  if (!isConnected || chainId !== 42161) {
    return null;
  }

  if (!currentCampaign || !artifacts || !addresses || !userClaim) {
    return null;
  }

  // Show claimed state if already claimed
  if (isClaimed) {
    return (
      <div className={`bg-grey10inverse dark:bg-grey10 border border-bronze3 rounded-lg p-6 w-full ${className}`}>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-bronze1 mb-2">{currentCampaign.name}</h2>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-green4 mb-2">
            ✅ Claimed
          </div>
          <p className="text-lightgrey1">Airdrop successfully claimed!</p>
        </div>

        <div className="mt-4 text-xs text-lightgrey10 text-center">
          <p className="text-green4">
            Contract: {addresses?.distributor ? `${addresses.distributor.slice(0, 6)}...${addresses.distributor.slice(-4)}` : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-grey10inverse dark:bg-grey10 border border-bronze3 rounded-lg p-6 w-full ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-bronze1 mb-2">{currentCampaign.name}</h2>
        {/* <p className="text-lightbronze1 text-sm">{currentCampaign.description}</p> */}
      </div>

      <div className="text-center mb-6">  <p className="text-lightgrey1">Your allocation</p>
        <div className="text-3xl font-bold text-bronze2 mb-2">
          {userClaim ? formatAmount(userClaim.amount, currentCampaign.tokenDecimals) : '0.00'} {currentCampaign.tokenSymbol}
        </div>

      </div>

      {contractError && (
        <div className="text-center py-4 mb-4">
          <div className="inline-flex items-center px-4 py-2 bg-yellow-900/30 text-yellow-400 rounded-full border border-yellow-700/50">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {contractError}
          </div>
        </div>
      )}

      <Button
        onClick={handleClaim}
        disabled={isClaiming || isWrongNetwork || !userClaim}
        className="w-full justify-center"
        variant="outline"
        size="lg"
      >
        {isClaiming ? 'Claiming...' : `Claim ${currentCampaign.tokenSymbol}`}
      </Button>


    </div>
  );
};
