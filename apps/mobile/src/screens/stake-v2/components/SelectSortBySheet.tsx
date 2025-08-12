import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CheckCircle } from 'phosphor-react-native';
import BottomModal from '../../../components/new-bottom-modal';
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';

import { STAKE_SORT_BY } from './SelectValidatorSheet';

const stackSortBy: STAKE_SORT_BY[] = ['Random', 'Amount staked', 'APR'];

type SelectSortByProps = {
  sortBy: STAKE_SORT_BY;
  setSortBy: (s: STAKE_SORT_BY) => void;
  isVisible: boolean;
  setVisible: (v: boolean) => void;
  onClose: () => void;
  activeChain: SupportedChain;
};

export default function SelectSortBySheet({
  sortBy,
  setSortBy,
  isVisible,
  setVisible,
  onClose,
}: SelectSortByProps) {
  return (
    <BottomModal
      isOpen={isVisible}
      onClose={onClose}
      title="Sort By"
      contentStyle={styles.modalContent}
    >
      <View style={styles.list}>
        {stackSortBy.map((element) => (
          <TouchableOpacity
            key={element}
            style={[
              styles.item,
              sortBy === element && styles.selectedItem,
            ]}
            onPress={() => {
              setVisible(false);
              setSortBy(element);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.itemText}>{element}</Text>
            <AnimatePresence>
              {sortBy === element && (
                <MotiView
                  from={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  transition={{ type: 'timing', duration: 200 }}
                >
                  <CheckCircle size={24} weight="fill" color="#22c55e" />
                </MotiView>
              )}
            </AnimatePresence>
          </TouchableOpacity>
        ))}
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    padding: 24,
  },
  list: {
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  selectedItem: {
    backgroundColor: '#e9ffe6',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#23272f',
  },
});
