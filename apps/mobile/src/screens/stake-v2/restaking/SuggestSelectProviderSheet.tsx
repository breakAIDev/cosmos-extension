import React from 'react';
import { View, StyleSheet } from 'react-native';

import BottomModal from '../../../components/new-bottom-modal';
import Text from '../../../components/text';
import { Button } from '../../../components/ui/button';
import { rootDenomsStore } from '../../../context/denoms-store-instance';

import { SelectProviderCard } from './SelectProviderCard';

type SuggestSelectProviderSheetProps = {
  isVisible: boolean;
  onClose: () => void;
  setShowSelectProviderSheet: () => void;
  onReviewStake: () => void;
};

export default function SuggestSelectProviderSheet({
  isVisible,
  onClose,
  setShowSelectProviderSheet,
  onReviewStake,
}: SuggestSelectProviderSheetProps) {
  return (
    <BottomModal isOpen={isVisible} onClose={onClose} title="Restake with a Provider" contentStyle={styles.modalContent}>
      <View style={styles.container}>
        <Text style={styles.tipText} size="sm">
          {"You're missing out on increased rewards. Select a provider to restake with for increased APR."}
        </Text>
        <SelectProviderCard
          selectDisabled={false}
          title="Provider"
          setShowSelectProviderSheet={setShowSelectProviderSheet}
          rootDenomsStore={rootDenomsStore}
        />
        <Button onPress={onReviewStake} style={styles.reviewBtn}>
          Review Stake
        </Button>
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 24,
  },
  container: {
    flexDirection: 'column',
    gap: 24,
    width: '100%',
  },
  tipText: {
    color: '#888', // or theme-based
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 15,
  },
  reviewBtn: {
    width: '100%',
    marginTop: 16,
  },
});
