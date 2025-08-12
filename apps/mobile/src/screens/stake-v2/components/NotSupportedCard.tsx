import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { useChainInfos } from '../../../hooks/useChainInfos';
import StakeStatusCard from './StakeStatusCard'; // You need to convert this as well!

export default function NotSupportedCard({ onAction }: { onAction: () => void }) {
  const activeChain = useActiveChain();
  const chainInfos = useChainInfos();
  const activeChainInfo = chainInfos[activeChain];

  // If you want to use a custom background, you can pass the colors as props or style directly.
  return (
    <StakeStatusCard
      title="Uh oh! Staking Unavailable..."
      onAction={onAction}
      message={`Staking is not yet available for ${activeChainInfo.chainName}. You can stake on other chains.`}
      // Below are example props. If your RN StakeStatusCard needs color props, pass color values, not Tailwind classes:
      backgroundColor="#FFF4E5"
      backgroundColorDark="#FFEDD5"
      color="#EA580C"
    />
  );
}
