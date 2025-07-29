import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ActivityType } from '@leapwallet/cosmos-wallet-hooks';
import { Images } from '../../../../assets/images';
import { LoaderAnimation } from '../../../components/loader/Loader';

export type ActivityIconProps = {
  img?: string;
  secondaryImg?: string;
  type: ActivityType;
  showLoader?: boolean;
  voteOption?: string;
  size?: 'sm' | 'md' | 'lg';
  isSuccessful: boolean;
};

const getVoteIcon = (voteOption: string): any => {
  switch (voteOption) {
    case 'Yes':
      return Images.Gov.VoteOptionYes;
    case 'No':
      return Images.Gov.VoteOptionNo;
    case 'No with Veto':
      return Images.Gov.VoteOptionNoWithVeto;
    case 'Abstain':
      return Images.Gov.VoteOptionAbstain;
    default:
      return Images.Activity.Voting;
  }
};

export const getActivityActionTypeIcon = (type: ActivityType, voteOption?: string): any => {
  switch (type) {
    case 'send':
      return Images.Activity.SendIcon;
    case 'receive':
      return Images.Activity.ReceiveIcon;
    case 'fallback':
      return Images.Activity.Fallback;
    case 'delegate':
      return Images.Activity.Delegate;
    case 'undelegate':
      return Images.Activity.Undelegate;
    case 'pending':
      return Images.Activity.Pending;
    case 'ibc/transfer':
    case 'swap':
      return Images.Activity.SwapIcon;
    case 'vote':
      return getVoteIcon(voteOption as string);
    case 'secretTokenTransfer':
      return Images.Activity.SendIcon;
    case 'liquidity/add':
      return Images.Activity.Delegate;
    case 'liquidity/remove':
      return Images.Activity.Undelegate;
    default:
      return Images.Activity.Fallback;
  }
};

export function ActivityIcon({
  img,
  secondaryImg,
  type,
  showLoader,
  voteOption,
  size = 'md',
  isSuccessful,
}: ActivityIconProps) {
  const icon = getActivityActionTypeIcon(type, voteOption);

  const containerSize = {
    sm: 32,
    md: 40,
    lg: 64,
  }[size];

  const iconSize = secondaryImg ? containerSize * 0.7 : containerSize;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <Image
        source={type === 'fallback' ? Images.Activity.Hash : { uri: img }}
        style={[
          secondaryImg ? styles.baseImageWithSecondary : styles.fullSize,
          { width: iconSize, height: iconSize },
        ]}
        resizeMode="contain"
      />

      {secondaryImg && (
        <Image
          source={{ uri: secondaryImg }}
          style={[
            styles.secondaryImage,
            {
              width: containerSize * 0.5,
              height: containerSize * 0.5,
            },
          ]}
          resizeMode="contain"
        />
      )}

      {showLoader && (
        <View style={styles.loaderWrapper}>
          <LoaderAnimation color="#29a874" style={styles.loader} />
        </View>
      )}

      {!secondaryImg && !showLoader && (
        <Image
          source={isSuccessful ? icon : Images.Activity.Error}
          style={styles.statusIcon}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  fullSize: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  baseImageWithSecondary: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  secondaryImage: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  loaderWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  loader: {
    height: 20,
    width: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  statusIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 16,
    height: 16,
  },
});
