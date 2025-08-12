import { FractionalizedNftInformation } from '@leapwallet/cosmos-wallet-hooks';
import { MapPin } from 'phosphor-react-native';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { NonFractionalizedNftDescriptionProps } from './index';

type RoomsCountProps = {
  noOfRooms: string;
  roomTitle: string;
};

function RoomsCount({ noOfRooms, roomTitle }: RoomsCountProps) {
  return (
    <View style={styles.roomsCount}>
      <Text style={styles.roomTitle}>{roomTitle}</Text>
      <Text style={styles.roomNo}>{noOfRooms}</Text>
    </View>
  );
}

export function FractionalizedNftDescription({ nftDetails }: NonFractionalizedNftDescriptionProps) {
  const { towerName, location, noOfBathrooms, noOfBedrooms, additionalFeatures, yourAllocations } = useMemo(() => {
    const _nftDetails = nftDetails as unknown as FractionalizedNftInformation;
    return {
      towerName: _nftDetails['Tower Name'],
      location: _nftDetails['Address'],
      noOfBathrooms: _nftDetails['Number of Bathrooms'],
      noOfBedrooms: _nftDetails['Number of Bedrooms'],
      additionalFeatures: _nftDetails['Additional Features'],
      yourAllocations: nftDetails?.extension?.allocations ?? 0,
    };
  }, [nftDetails]);

  return (
    <View>
      <Text style={styles.towerName}>{towerName ?? ''}</Text>

      {location ? (
        <View style={styles.locationRow}>
          <MapPin size={16} color="#18181b" weight="regular" style={styles.locationIcon} />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      ) : null}

      {yourAllocations ? (
        <View style={styles.flexRow}>
          <RoomsCount noOfRooms={yourAllocations} roomTitle="Your Allocations" />
        </View>
      ) : null}

      <View style={styles.flexRow}>
        {noOfBathrooms ? <RoomsCount noOfRooms={noOfBathrooms} roomTitle="Bathrooms" /> : null}
        {noOfBedrooms ? <RoomsCount noOfRooms={noOfBedrooms} roomTitle="Bedrooms" /> : null}
      </View>

      {additionalFeatures ? (
        <View style={styles.featureSection}>
          <Text style={styles.featureHeader}>Additional Features</Text>
          {additionalFeatures.map((feature: string, index: number) => (
            <Text key={`${feature}-${index}`} style={styles.featureItem}>
              {feature}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  towerName: {
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 16,
    marginBottom: 0,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 0,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    color: '#18181b',
    fontSize: 13,
    textAlign: 'left',
  },
  flexRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    marginBottom: 0,
  },
  roomsCount: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 80,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    marginRight: 8,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  roomTitle: {
    color: '#9ca3af',
    fontSize: 13,
  },
  roomNo: {
    color: '#18181b',
    fontWeight: 'bold',
    fontSize: 15,
  },
  featureSection: {
    marginTop: 18,
    flexDirection: 'column',
    gap: 2,
  },
  featureHeader: {
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 2,
  },
  featureItem: {
    color: '#18181b',
    fontSize: 14,
    marginBottom: 2,
  },
});
