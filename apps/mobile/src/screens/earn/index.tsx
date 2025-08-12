import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store';
import { Header, HeaderActionType } from '@leapwallet/leap-ui';
import { TestnetAlertStrip } from '../../components/alert-strip';
import { EmptyCard } from '../../components/empty-card';
import PopupLayout from '../../components/layout/popup-layout';
import { useChainPageInfo } from '../../hooks';
import useActiveWallet from '../../hooks/settings/useActiveWallet';
import Sort from '../../../assets/icons/sort';
import { LeapCosmos } from '../../../assets/images/logos';
import { observer } from 'mobx-react-lite';
import SelectChain from '../home/SelectChain';
import React, { useState } from 'react';
import { globalSheetsStore } from '../../context/global-sheets-store';

import { DisplaySettingsModal } from './display-settings-modal';
import InvestViewContainer from './invest-view';
import type { DisplaySettings } from './types';

import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView } from 'react-native';

const EarnPage = observer(({ chainTagsStore }: { chainTagsStore: ChainTagsStore }) => {
  const [showChainSelector, setShowChainSelector] = useState(false);
  const [showDisplaySettings, setShowDisplaySettings] = useState(false);

  const { activeWallet } = useActiveWallet();
  const { headerChainImgSrc } = useChainPageInfo();
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    sortBy: 'tvl',
  });

  if (!activeWallet) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <PopupLayout>
          <EmptyCard src={LeapCosmos} heading="No wallet found" />
        </PopupLayout>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <PopupLayout
        header={
          <Header
            action={{
              onClick: () => globalSheetsStore.toggleSideNav(),
              type: HeaderActionType.NAVIGATION,
            }}
            imgSrc={headerChainImgSrc}
            onImgClick={() => setShowChainSelector(true)}
            title="Earn"
          />
        }
      >
        <TestnetAlertStrip />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerSection}>
            <View>
              <Text style={styles.title}>Earn</Text>
              <Text style={styles.subtitle}>Invest your crypto and earn rewards</Text>
            </View>
            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowDisplaySettings(true)}
              activeOpacity={0.85}
            >
              <Sort size={20} color={'#1f2937'} />
            </TouchableOpacity>
          </View>
          <InvestViewContainer displaySettings={displaySettings} />
        </ScrollView>

        <DisplaySettingsModal
          isOpen={showDisplaySettings}
          onClose={() => setShowDisplaySettings(false)}
          settings={displaySettings}
          onSettingsChange={setDisplaySettings}
        />
      </PopupLayout>

      <SelectChain
        isVisible={showChainSelector}
        onClose={() => setShowChainSelector(false)}
        chainTagsStore={chainTagsStore}
      />
      {/* If you use BottomNav, add it here */}
      {/* <BottomNav activeLabel={BottomNavLabel.Earn} /> */}
    </SafeAreaView>
  );
});

export default EarnPage;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 84, // To mimic `mb-[84px]`
    flexGrow: 1,
  },
  headerSection: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    color: '#111827', // black-100
    fontWeight: 'bold',
    width: 194,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563', // gray-600
    fontWeight: 'bold',
    marginTop: 4,
  },
  sortButton: {
    height: 36,
    width: 36,
    backgroundColor: '#fff',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    // Add shadow for better appearance if needed
    elevation: 2,
  },
  header: {
    minWidth: 48,
    height: 36,
    paddingHorizontal: 8,      // px-2 = 8px horizontal
    backgroundColor: '#FFFFFF',// default bg
    borderRadius: 9999,        // rounded-full
    justifyContent: 'center',
    alignItems: 'center',
    // For dynamic/dark/hover, see notes below
  },
});
