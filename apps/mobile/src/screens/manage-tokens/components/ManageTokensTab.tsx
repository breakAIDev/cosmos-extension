import React from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';

import { ManuallyAddedTokensTab } from './ManuallyAddedTokensTab';
import { SupportedTokensTab } from './SupportedTokensTab';
import { SupportedToken } from './SupportedTokens';
import { NativeDenom } from '@leapwallet/cosmos-wallet-sdk';

const tabs = [
  { label: 'Supported', value: 'supported' },
  { label: 'Manually added', value: 'manually-added' },
];

const TAB_WIDTH = Dimensions.get('window').width / tabs.length;

export const ManageTokensTabs = ({
  activeTab,
  setActiveTab,
  filteredSupportedTokens,
  filteredManuallyAddedTokens,
  fetchedTokens,
  handleToggleChange,
  onDeleteClick,
  handleAddNewTokenClick,
  searchedText,
  fetchingContract,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredSupportedTokens: SupportedToken[];
  filteredManuallyAddedTokens: NativeDenom[];
  fetchedTokens: string[];
  handleToggleChange: (isEnabled: boolean, coinMinimalDenom: string) => Promise<void>;
  onDeleteClick: (token: NativeDenom) => void;
  handleAddNewTokenClick: () => void;
  searchedText: string;
  fetchingContract: boolean;
}) => {
  const indicatorPosition = React.useRef(new Animated.Value(tabs.findIndex(t => t.value === activeTab) * TAB_WIDTH)).current;

  React.useEffect(() => {
    Animated.timing(indicatorPosition, {
      toValue: tabs.findIndex(t => t.value === activeTab) * TAB_WIDTH,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [activeTab, indicatorPosition]);

  return (
    <View>
      {/* Tab Header */}
      <View style={styles.tabHeader}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.value}
            style={styles.tabBtn}
            activeOpacity={0.7}
            onPress={() => setActiveTab(tab.value)}
          >
            <View style={{ width: TAB_WIDTH, alignItems: 'center', paddingBottom: 8 }}>
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === tab.value && styles.tabLabelActive,
                ]}
              >
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              left: indicatorPosition,
              width: TAB_WIDTH,
            },
          ]}
        />
      </View>

      {/* Tab Content */}
      {activeTab === 'supported' ? (
        <SupportedTokensTab
          filteredSupportedTokens={filteredSupportedTokens}
          handleToggleChange={handleToggleChange}
          fetchingContract={fetchingContract}
          handleAddNewTokenClick={handleAddNewTokenClick}
          searchedText={searchedText}
        />
      ) : (
        <ManuallyAddedTokensTab
          filteredManuallyAddedTokens={filteredManuallyAddedTokens}
          handleToggleChange={handleToggleChange}
          fetchedTokens={fetchedTokens}
          onDeleteClick={onDeleteClick}
          fetchingContract={fetchingContract}
          handleAddNewTokenClick={handleAddNewTokenClick}
          searchedText={searchedText}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // secondary-300
    position: 'relative',
    height: 44,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  tabBtn: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  tabLabel: {
    color: '#64748b', // muted-foreground
    fontSize: 15,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#16a34a', // accent-green
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#22d3ee', // primary
    borderRadius: 2,
  },
});

