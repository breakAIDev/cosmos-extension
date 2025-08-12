import { Provider } from '@leapwallet/cosmos-wallet-sdk';
import Text from '../../../components/text';
import React from 'react';
import { View, StyleSheet } from 'react-native';

type ProviderTooltipProps = {
  provider: Provider;
  onClose?: () => void; // Optional, if you want to add a close button
};

export default function ProviderTooltip({ provider }: ProviderTooltipProps) {
  return (
    <View style={styles.tooltipContainer}>
      {provider.specs.length > 0 && (
        <Text size="sm" style={styles.boldText} color="text-gray-900">
          {provider.specs
            .map((val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase())
            .join(', ')}
        </Text>
      )}

      <Text size="xs" style={styles.mediumText} color="text-gray-700">
        Commission{' '}
        {parseInt(provider.delegateCommission ?? '0') > 0
          ? `${provider.delegateCommission}%`
          : '-'}
      </Text>

      <Text size="xs" style={styles.mediumText} color="text-gray-700">
        APR is estimated and influenced by various factors such as number of delegators. More information is available
        in our tokenomics: docs.lavanet.xyz/token
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tooltipContainer: {
    flexDirection: 'column',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB', // gray-50
    borderWidth: 1,
    borderColor: '#D1D5DB', // gray-300
    borderRadius: 12,
    gap: 6,
    width: 220,
    // If you want dark mode, handle with a parent prop or context
  },
  boldText: {
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 2,
  },
  mediumText: {
    fontWeight: '500',
    textAlign: 'left',
    marginBottom: 2,
  },
});
