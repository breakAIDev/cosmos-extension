import { NftAttribute } from '@leapwallet/cosmos-wallet-hooks';
import { CardDivider } from '@leapwallet/leap-ui';
import { ProposalDescription } from '../../../components/proposal-description';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { NftDetailsType } from '../context';

export type NonFractionalizedNftDescriptionProps = {
  nftDetails: NftDetailsType;
  color: string;
};

export function NonFractionalizedNftDescription({ nftDetails, color }: NonFractionalizedNftDescriptionProps) {
  return (
    <View>
      <ProposalDescription
        title={`About ${nftDetails?.name ?? ''}`}
        description={
          nftDetails?.description ??
          nftDetails?.extension?.description ??
          `${nftDetails?.collection?.name ?? ''} - ${nftDetails?.name}`
        }
        btnColor={color}
        style={styles.proposalDescription}
      />

      {nftDetails?.attributes && nftDetails.attributes.length ? (
        <>
          <CardDivider />
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.featuresWrap}>
            {nftDetails.attributes.map((m: NftAttribute, index: number) => {
              if (!m.trait_type || !m.value) {
                return null;
              }
              return (
                <View key={index} style={styles.featureBox}>
                  <Text style={styles.featureTrait}>{(m.trait_type ?? '').toLowerCase()}</Text>
                  <Text style={styles.featureValue}>{m.value ?? ''}</Text>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  proposalDescription: {
    marginVertical: 16,
  },
  featuresTitle: {
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#9ca3af',
    fontSize: 13,
    marginTop: 24,
    marginBottom: 8,
    width: '100%',
  },
  featuresWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureBox: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6', // bg-gray-100
    marginRight: 8,
    minWidth: 80,
    marginBottom: 8,
  },
  featureTrait: {
    color: '#9ca3af', // text-gray-400
    fontSize: 13,
    textTransform: 'capitalize',
  },
  featureValue: {
    color: '#18181b', // text-gray-900
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
