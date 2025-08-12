import { NftStore } from '@leapwallet/cosmos-wallet-store';
import { Buttons } from '@leapwallet/leap-ui';
import { ArrowCounterClockwise } from 'phosphor-react-native';
import Text from '../../../components/text';
import { Images } from '../../../../assets/images';
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

import { CantSeeNfts } from './index';

type NetworkErrorInNftProps = {
  title: string;
  subTitle: string;
  showRetryButton?: boolean;
  className?: string;
  nftStore: NftStore;
  setShowAddCollectionSheet: (value: React.SetStateAction<boolean>) => void;
};

export default function NetworkErrorInNft({
  title,
  subTitle,
  showRetryButton = false,
  nftStore,
  setShowAddCollectionSheet,
}: NetworkErrorInNftProps) {
  const onRetry = () => {
    nftStore.loadNfts();
  };

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <Image source={{uri: Images.Misc.FrogSad}} style={styles.frogImg} />
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.subTitleText}>{subTitle}</Text>
        {showRetryButton && (
          <Buttons.Generic
            size="normal"
            style={styles.retryBtn}
            title={'Retry'}
            onClick={onRetry}
          >
            <View style={styles.retryBtnContent}>
              <Text style={styles.retryBtnLabel}>Retry</Text>
              <ArrowCounterClockwise
                size={20}
                color="#fff"
                style={{ transform: [{ scaleX: -1 }] }}
              />
            </View>
          </Buttons.Generic>
        )}
      </View>
      <CantSeeNfts
        openAddCollectionSheet={() => setShowAddCollectionSheet(true)}
        style={styles.cantSee}
        nftStore={nftStore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingTop: 32,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
  },
  frogImg: {
    width: 80,
    height: 80,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#222',
  },
  subTitleText: {
    fontSize: 14,
    color: '#18181b',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 2,
  },
  retryBtn: {
    width: '100%',
    marginTop: 24,
    backgroundColor: '#18181b',
  },
  retryBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  retryBtnLabel: {
    color: '#fff',
    marginRight: 4,
    fontWeight: 'bold',
    fontSize: 15,
  },
  cantSee: {
    marginTop: 16,
    width: '100%',
  },
});
