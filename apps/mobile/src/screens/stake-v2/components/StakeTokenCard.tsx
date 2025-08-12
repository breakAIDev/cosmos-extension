import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import TokenImageWithFallback from '../../../components/token-image-with-fallback';

type StakeTokenCardProps = {
  tokenName: string;
  chainName: string;
  chainLogo: string;
  apr: string;
  amount: string;
  dollarAmount: string;
  onPress: () => void;  // Change to onPress for RN convention
};

export function StakeTokenCard({
  tokenName,
  chainName,
  chainLogo,
  apr,
  amount,
  dollarAmount,
  onPress,
}: StakeTokenCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {/* Token + Chain name */}
      <View style={styles.tokenRow}>
        <TokenImageWithFallback
          assetImg={chainLogo}
          text={tokenName}
          altText={`${chainName} logo`}
          imageStyle={styles.tokenImage}
          containerStyle={styles.tokenImageContainer}
          textStyle={styles.tokenImageText}
        />
        <View style={styles.tokenLabelCol}>
          <Text style={styles.tokenName}>{tokenName}</Text>
          <Text style={styles.chainName}>{chainName}</Text>
        </View>
      </View>

      {/* APR */}
      <Text style={styles.apr}>{apr}</Text>

      {/* Amounts */}
      <View style={styles.amountCol}>
        {dollarAmount !== '-' ? (
          <Text style={styles.dollarAmount}>{dollarAmount}</Text>
        ) : null}
        <Text style={styles.amount}>{amount}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F1F5F9', // secondary-100
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    // You may want to add a shadow if needed
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 150,
    gap: 8,
  },
  tokenImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  tokenImageContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6', // gray-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenImageText: {
    fontSize: 10,
    lineHeight: 14,
  },
  tokenLabelCol: {
    flexDirection: 'column',
    marginLeft: 6,
  },
  tokenName: {
    color: '#111827', // black-100
    fontWeight: '700',
    fontSize: 15,
  },
  chainName: {
    color: '#6B7280', // gray-600
    fontWeight: '500',
    fontSize: 12,
  },
  apr: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '400',
  },
  amountCol: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    minWidth: 90,
  },
  dollarAmount: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'right',
  },
  amount: {
    color: '#6B7280',
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'right',
  },
});

export default StakeTokenCard;
