import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { activeChainStore } from '../../../context/active-chain-store';
import { autoFetchedCW20DenomsStore, cw20DenomsStore } from '../../../context/denoms-store-instance';

import { ManageTokensEmptyCard, SupportedToken } from '.';
import { SupportedTokenCard } from './SupportedTokenCard';

type Props = {
  filteredSupportedTokens: SupportedToken[];
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>;
  fetchingContract: boolean;
  handleAddNewTokenClick: () => void;
  searchedText: string;
};

export const SupportedTokensTab = ({
  filteredSupportedTokens,
  handleToggleChange,
  fetchingContract,
  handleAddNewTokenClick,
  searchedText,
}: Props) => {
  if (fetchingContract === true) {
    return (
      <View style={styles.centered}>
        <LoaderAnimation color="#29a874" />
      </View>
    );
  }

  if (!fetchingContract && filteredSupportedTokens.length === 0) {
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
        data={filteredSupportedTokens}
        keyExtractor={(item) => item.coinMinimalDenom}
        renderItem={({ item, index }) => (
          <SupportedTokenCard
            key={item.coinMinimalDenom}
            activeChainStore={activeChainStore}
            cw20DenomsStore={cw20DenomsStore}
            autoFetchedCW20DenomsStore={autoFetchedCW20DenomsStore}
            token={item}
            tokensLength={filteredSupportedTokens.length}
            index={index}
            handleToggleChange={handleToggleChange}
          />
        )}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 24, // px-6 ~ 24
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
