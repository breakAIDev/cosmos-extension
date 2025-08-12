import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDown, CurrencyCircleDollar, ShoppingBag } from 'phosphor-react-native';
import { SelectedNetwork, useIsFeatureExistForChain } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import BottomModal from '../../../../components/bottom-modal';

type MoreOptionsSheetProps = {
  isVisible: boolean;
  title: string;
  onClose: () => void;
  onBuy: () => void;
  onStake: () => void;
  onDeposit: () => void;
  isStakeDisabled: boolean;
  isBuyDisabled: boolean;
  forceChain: SupportedChain;
  forceNetwork: SelectedNetwork;
};

const CardButton = ({
  onPress,
  icon,
  label,
  disabled,
}: {
  onPress: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.card, disabled && styles.cardDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}
  >
    <View style={styles.icon}>{icon}</View>
    <Text style={styles.label}>{label}</Text>
  </TouchableOpacity>
);

export function MoreOptionsSheet({
  isVisible,
  title,
  onClose,
  onBuy,
  onStake,
  onDeposit,
  isStakeDisabled,
  isBuyDisabled,
  forceChain,
  forceNetwork,
}: MoreOptionsSheetProps) {
  const isStakeComingSoon = useIsFeatureExistForChain({
    checkForExistenceType: 'comingSoon',
    feature: 'stake',
    platform: 'Extension',
    forceChain,
    forceNetwork,
  });

  const isStakeNotSupported = useIsFeatureExistForChain({
    checkForExistenceType: 'notSupported',
    feature: 'stake',
    platform: 'Extension',
    forceChain,
    forceNetwork,
  });

  return (
    <BottomModal isOpen={isVisible} title={title} onClose={onClose}>
      <View style={styles.container}>
        {/* Stake */}
        {!isStakeDisabled && !isStakeComingSoon && !isStakeNotSupported && (
          <CardButton
            label="Stake"
            icon={<CurrencyCircleDollar size={24} color="#111" />}
            onPress={onStake}
          />
        )}
        {/* Deposit */}
        <CardButton
          label="Deposit"
          icon={<ArrowDown size={24} color="#111" />}
          onPress={onDeposit}
        />
        {/* Buy */}
        {!isBuyDisabled && (
          <CardButton
            label="Buy"
            icon={<ShoppingBag size={24} color="#111" />}
            onPress={onBuy}
          />
        )}
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
});
