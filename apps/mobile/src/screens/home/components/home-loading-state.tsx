import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'; // or your skeleton lib
import { BalanceHeaderLoading } from './balance-header';
import { GeneralHomeHeader } from './general-home-header';
import { HomeButtons } from './index';
import { Button } from '../../../components/ui/button';
import { SearchIcon } from '../../../../assets/icons/search-icon';
import { AggregatedLoadingList } from '../../../components/aggregated/AggregatedLoading';
import { BottomNav } from '../../../components/bottom-nav/v2';
import { BottomNavLabel } from '../../../components/bottom-nav/bottom-nav-items';
import { useWalletInfo } from '../../../hooks';

export function BannersLoading() {
  return (
    <View style={styles.bannersLoadingContainer}>
      <SkeletonPlaceholder borderRadius={12}>
        <SkeletonPlaceholder.Item width="100%" height={64} borderRadius={12} />
      </SkeletonPlaceholder>
      <View style={styles.skeletonNavDots}>
        <SkeletonPlaceholder borderRadius={999}>
          <SkeletonPlaceholder.Item width={20} height={5} borderRadius={999} />
        </SkeletonPlaceholder>
      </View>
    </View>
  );
}

export const HomeLoadingState = () => {
  const { activeWallet } = useWalletInfo();

  if (!activeWallet) {
    return null;
  }

  return (
    <>
      <View style={styles.container}>
        <GeneralHomeHeader disableWalletButton isLoading />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.balanceHeaderWrapper}>
            <BalanceHeaderLoading watchWallet={activeWallet?.watchWallet} />
          </View>

          {!activeWallet?.watchWallet && <HomeButtons skipVote />}

          <BannersLoading />

          <View style={styles.tokensHeader}>
            <Text style={styles.tokensHeaderText}>Your tokens</Text>
            <Button
              variant="secondary"
              size="icon"
              onPress={() => {
                // Implement search trigger
              }}
              style={styles.searchButton}
            >
              <SearchIcon size={16} />
            </Button>
          </View>

          <View style={styles.loadingListWrapper}>
            <AggregatedLoadingList />
          </View>
        </ScrollView>
      </View>

      <BottomNav label={BottomNavLabel.Home} disableLottie />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Or your themed background
  },
  scrollContent: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 80,
  },
  balanceHeaderWrapper: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannersLoadingContainer: {
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'column',
  },
  skeletonNavDots: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    height: 17,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tokensHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  tokensHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A202C', // Tailwind text-foreground
  },
  searchButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6', // Tailwind bg-secondary-100
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingListWrapper: {
    width: '100%',
    paddingHorizontal: 20,
  },
});
