import { useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import { CardDivider } from '@leapwallet/leap-ui'; // Make sure this is React Native compatible, or replace with a View
import { CheckCircle } from 'phosphor-react-native';
import BottomModal from '../../components/bottom-modal';
import React from 'react';
import { getChainColor } from '../../theme/colors';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { DisplaySettings, infoField } from './types';

export const SortBy: Record<infoField, string> = {
  tvl: 'Total Volume Locked (TVL)',
  apr: 'Annual Percentage Return (APR)',
};

type DisplaySettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  settings: DisplaySettings;
  onSettingsChange: (_: DisplaySettings) => void;
};

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const options = Object.entries(SortBy);
  const activeChain = useActiveChain();

  return (
    <BottomModal isOpen={isOpen} onClose={onClose} title="Sort by" closeOnBackdropClick>
      <View style={styles.container}>
        {options.map(([key, label], index) => (
          <React.Fragment key={key}>
            <TouchableOpacity
              style={styles.optionButton}
              activeOpacity={0.7}
              onPress={() => {
                onSettingsChange({ ...settings, sortBy: key as infoField });
              }}
            >
              <Text style={styles.optionText}>{label}</Text>
              {settings.sortBy === key ? (
                <CheckCircle
                  weight="fill"
                  size={24}
                  color={getChainColor(activeChain)}
                />
              ) : null}
            </TouchableOpacity>
            {index !== options.length - 1 && (
              typeof CardDivider === "function"
                ? <CardDivider />
                : <View style={styles.divider} />
            )}
          </React.Fragment>
        ))}
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#fff', // replace with dark mode value if needed
    overflow: 'hidden',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  optionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e5e7eb', // gray-200
  },
});
