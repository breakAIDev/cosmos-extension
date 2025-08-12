import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import { LoaderAnimation } from '../../../components/loader/Loader';
import {
  betaCW20DenomsStore,
  betaERC20DenomsStore,
  disabledCW20DenomsStore,
  enabledCW20DenomsStore,
} from '../../../context/denoms-store-instance';

import { ManageTokensEmptyCard } from '.';
import { ManuallyAddedTokenCard } from './ManuallyAddedTokenCard';

// Pass in your stores as props or via context if required for mobile

export const ManuallyAddedTokensTab = ({
  filteredManuallyAddedTokens,
  handleToggleChange,
  fetchedTokens,
  onDeleteClick,
  fetchingContract,
  handleAddNewTokenClick,
  searchedText,
}: {
  filteredManuallyAddedTokens: NativeDenom[];
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>;
  fetchedTokens: string[];
  onDeleteClick: (token: NativeDenom) => void;
  fetchingContract: boolean;
  handleAddNewTokenClick: () => void;
  searchedText: string;
}) => {
  if (fetchingContract === true) {
    return (
      <View style={styles.centered}>
        <LoaderAnimation color="#29a874" />
      </View>
    );
  }

  if (fetchingContract === false && filteredManuallyAddedTokens.length === 0) {
    return (
      <ManageTokensEmptyCard
        onAddTokenClick={handleAddNewTokenClick}
        searchedText={searchedText}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredManuallyAddedTokens}
        keyExtractor={(item, idx) => `${item?.coinMinimalDenom ?? idx}`}
        renderItem={({ item, index }) => (
          <ManuallyAddedTokenCard
            index={index}
            token={item}
            tokensLength={filteredManuallyAddedTokens.length}
            handleToggleChange={handleToggleChange}
            fetchedTokens={fetchedTokens}
            onDeleteClick={onDeleteClick}
            betaCW20DenomsStore={betaCW20DenomsStore}
            disabledCW20DenomsStore={disabledCW20DenomsStore}
            enabledCW20DenomsStore={enabledCW20DenomsStore}
            betaERC20DenomsStore={betaERC20DenomsStore}
          />
        )}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
