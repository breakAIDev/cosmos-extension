// src/screens/.../components/TokenContractAddress.tsx (React Native)

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { GenericCard } from '@leapwallet/leap-ui';
import { Colors } from '../../../theme/colors';

type TokenContractAddressProps = {
  address: string;
  img?: ReactNode;
};

export function TokenContractAddress({ address, img }: TokenContractAddressProps) {
  if (!address) {
    return (
      <View style={styles.skeletonContainer}>
        <Text style={styles.label}>Contract Address</Text>

        <SkeletonPlaceholder
          backgroundColor={Colors.gray300}
          highlightColor={Colors.gray200}
          borderRadius={4}
        >
          <SkeletonPlaceholder.Item width="100%" height={14} style={{ marginTop: 2 }} />
        </SkeletonPlaceholder>

        <SkeletonPlaceholder
          backgroundColor={Colors.gray300}
          highlightColor={Colors.gray200}
          borderRadius={4}
        >
          <SkeletonPlaceholder.Item width={90} height={14} style={{ marginTop: 2 }} />
        </SkeletonPlaceholder>
      </View>
    );
  }

  return (
    <GenericCard
      title={<Text style={styles.cardTitle}>Contract Address</Text>}
      subtitle={<Text style={styles.cardSubtitle}>{address}</Text>}
      style={styles.card}
      img={img ?? null}
      size="sm"
      isRounded
    />
  );
}

const styles = StyleSheet.create({
  skeletonContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 16, // px-4
    backgroundColor: Colors.white100, // dark mode swap if needed
    minWidth: 344,
    height: 80,
    borderRadius: 16,
    paddingBottom: 8, // pb-2
    marginVertical: 20, // my-5
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.black100, // dark mode swap if needed
    textAlign: 'left',
    maxWidth: 170,
  },
  card: {
    height: 80,
    paddingVertical: 8, // py-8 was pixel-based in web; adjust to taste
    marginVertical: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  cardSubtitle: {
    flexWrap: 'wrap',
  },
});
