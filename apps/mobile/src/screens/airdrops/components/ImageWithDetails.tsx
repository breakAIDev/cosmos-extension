import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Images } from '../../../../assets/images';
import { AirdropEligibilityInfo, formatTokenAmount } from '@leapwallet/cosmos-wallet-hooks';

interface ImageWithDetailsProps {
  selectedAirdrop: AirdropEligibilityInfo;
  isClaimPeriodOver: boolean;
  isClaimable: boolean;
}

export default function ImageWithDetails({ selectedAirdrop, isClaimPeriodOver, isClaimable }: ImageWithDetailsProps) {
  const formattedAmount = formatTokenAmount(
    String(selectedAirdrop?.totalAmount),
    selectedAirdrop?.tokenInfo?.[0]?.denom,
    2,
  );

  return (
    <View style={styles.container}>
      {isClaimPeriodOver ? (
        <Image
          source={{uri: Images.Airdrop.airdropOver}}
          style={styles.banner}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.relative}>
          <Image
            source={{uri: Images.Airdrop.airdropBanner}}
            style={styles.banner}
            resizeMode="contain"
          />
          <Image
            source={
              typeof selectedAirdrop?.airdropIcon === 'string'
                ? { uri: selectedAirdrop?.airdropIcon }
                : selectedAirdrop?.airdropIcon
            }
            style={styles.tokenIcon}
            resizeMode="cover"
          />
        </View>
      )}

      <Text style={styles.title}>
        {isClaimPeriodOver
          ? 'You were eligible for'
          : isClaimable
            ? 'You can claim'
            : 'You are eligible for'}
        {'\n'}
        <Text style={styles.amount}>
          {selectedAirdrop?.totalAmount ? formattedAmount : selectedAirdrop?.name}
        </Text>{' '}
        Airdrop
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 24,
  },
  banner: {
    width: 220,
    height: 110,
    borderRadius: 18,
  },
  relative: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    position: 'absolute',
    top: 5,
    right: 65,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222', // for dark mode, use '#fff'
  },
  amount: {
    color: '#16a34a', // green-600
    fontWeight: 'bold',
  },
});
