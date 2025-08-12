import React from 'react';
import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';

import StakeStatusCard from './StakeStatusCard'; // <-- Make sure you have RN version!

type ComingSoonCardProps = {
  onAction: () => void;
};

export default function ComingSoonCard({ onAction }: ComingSoonCardProps) {
  const activeChain = useActiveChain();
  const chainInfos = useChainInfos();
  const activeChainInfo = chainInfos[activeChain];

  return (
    <StakeStatusCard
      title="Coming soon!"
      onAction={onAction}
      message={`Staking for ${activeChainInfo.chainName} is coming soon. Devs are hard at work. Stay tuned.`}
      backgroundColor="#DBEAFE"       // blue-100
      backgroundColorDark="#1E3A8A"   // blue-900
      color="#2563EB"                 // blue-600
      // colorDark="#60A5FA"             // blue-400
    />
  );
}
