import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks';
import { PageName } from '../../services/config/analytics';
import { usePageView } from '../../hooks/analytics/usePageView';

import { AirdropsHeader } from './AirdropsHeader';
import ClaimButton from './components/ClaimButton';
import ClaimPeriod from './components/ClaimPeriod';
import EligibleWallets from './components/EligibleWallets';
import FailedAirdropsDetails from './components/FailedAirdropsDetails';
import ImageWithDetails from './components/ImageWithDetails';

export default function AirdropsDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  // Expecting airdropId passed as route param
  const airdropId = route.params?.airdropId;
  const airdropsEligibilityData = useAirdropsEligibilityData() || {};
  const selectedAirdrop = Object.values(airdropsEligibilityData).find(
    (d) => d?.id === airdropId,
  );

  const claimStartDate = selectedAirdrop?.claimStartDate ? new Date(selectedAirdrop.claimStartDate) : null;
  const claimEndDate = selectedAirdrop?.claimEndDate ? new Date(selectedAirdrop.claimEndDate) : null;
  const todaysDate = new Date();
  const isClaimPeriodOver = claimEndDate ? claimEndDate < todaysDate : false;
  const isClaimable = !!selectedAirdrop?.CTAInfo?.text;
  const isFailedAirdrop = selectedAirdrop?.status === 'failed';

  // If you use analytics tracking, enable this line:
  // usePageView(`${PageName.Airdrops} ${selectedAirdrop?.name}` as PageName)

  useEffect(() => {
    if (!selectedAirdrop) {
      navigation.navigate('Airdrops'); // Replace with your actual route name for the list
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <AirdropsHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {isFailedAirdrop || !selectedAirdrop ? (
          <FailedAirdropsDetails />
        ) : (
          <>
            <ImageWithDetails
              selectedAirdrop={selectedAirdrop}
              isClaimPeriodOver={isClaimPeriodOver}
              isClaimable={isClaimable}
            />
            {isClaimable && !isClaimPeriodOver && (
              <ClaimButton selectedAirdrop={selectedAirdrop} />
            )}
            <ClaimPeriod
              claimStartDate={claimStartDate}
              claimEndDate={claimEndDate}
              isClaimPeriodOver={isClaimPeriodOver}
            />
            <EligibleWallets selectedAirdrop={selectedAirdrop} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB', // secondary-50
  },
  scrollContent: {
    padding: 28,
    paddingBottom: 32,
    minHeight: '100%',
  },
});
