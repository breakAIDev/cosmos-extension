import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { CaretRight } from '@phosphor-icons/react';
import { observer } from 'mobx-react-lite';
import { ActivityCardContent } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { hideAssetsStore } from '../../../context/hide-assets-store';
import { useActivityImage } from '../../../hooks/activity/useActivityImage';
import { formatTokenAmount } from '../../../utils/strings';
import { ActivityIcon } from './index';

export type ActivityCardProps = {
  content: ActivityCardContent;
  showLoader?: boolean;
  onClick?: () => void;
  isSuccessful: boolean;
  containerStyle?: ViewStyle;
  forceChain?: SupportedChain;
  titleStyle?: TextStyle;
  imgSize?: 'sm' | 'md' | 'lg';
};

function ActivityCardView({
  content,
  onClick,
  showLoader,
  isSuccessful,
  containerStyle,
  forceChain,
  titleStyle,
  imgSize,
}: ActivityCardProps) {
  const {
    txType,
    title1,
    subtitle1,
    sentTokenInfo,
    sentAmount,
    receivedAmount,
    sentUsdValue,
    img: customImage,
    secondaryImg,
    receivedTokenInfo,
  } = content;

  const defaultImg = useActivityImage(txType, forceChain);
  const img = customImage || defaultImg;

  const sentAmountInfo =
    sentAmount && sentTokenInfo ? formatTokenAmount(sentAmount, sentTokenInfo.coinDenom) : undefined;
  const receivedAmountInfo =
    receivedAmount && receivedTokenInfo ? formatTokenAmount(receivedAmount, receivedTokenInfo.coinDenom) : undefined;

  const balanceReduced = txType === 'delegate' || txType === 'send' || txType === 'liquidity/add';
  const balanceIncreased = txType === 'undelegate' || txType === 'receive' || txType === 'liquidity/remove';

  return (
    <TouchableOpacity
      style={[styles.container, containerStyle]}
      activeOpacity={onClick ? 0.7 : 1}
      onPress={onClick}
    >
      <View style={styles.row}>
        <ActivityIcon
          showLoader={showLoader}
          voteOption={txType === 'vote' ? title1 : ''}
          secondaryImg={secondaryImg}
          type={txType}
          isSuccessful={isSuccessful}
          size={imgSize}
          img={img}
        />
        <View style={styles.textBlock}>
          <Text style={[styles.title, titleStyle]} numberOfLines={1}>
            {title1}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle1}
          </Text>
        </View>
        <View style={styles.flexGrow} />
        <View style={styles.amountBlock}>
          {txType === 'swap' ? (
            <>
              {receivedAmountInfo && (
                <Text style={[styles.swapAmount, { color: '#29a874' }]}>
                  {balanceReduced && '-'} {hideAssetsStore.formatHideBalance(receivedAmountInfo)}
                </Text>
              )}
              {sentAmountInfo && (
                <Text style={styles.swapSubAmount}>
                  {balanceReduced && '-'} {hideAssetsStore.formatHideBalance(sentAmountInfo)}
                </Text>
              )}
            </>
          ) : (
            <>
              {sentUsdValue && (
                <Text
                  style={[
                    styles.usdValue,
                    balanceReduced
                      ? { color: '#e94f4f' }
                      : balanceIncreased
                      ? { color: '#29a874' }
                      : { color: '#000' },
                  ]}
                >
                  {balanceReduced && '-'} ${hideAssetsStore.formatHideBalance(Number(sentUsdValue).toFixed(2))}
                </Text>
              )}
              {sentAmountInfo && (
                <Text style={styles.tokenAmount}>
                  {balanceReduced && '-'} {hideAssetsStore.formatHideBalance(sentAmountInfo)}
                </Text>
              )}
            </>
          )}
        </View>
        {onClick && <CaretRight size={16} color="#aaa" weight="regular" />}
      </View>
    </TouchableOpacity>
  );
}

export const ActivityCard = observer(ActivityCardView);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f4f7', // bg-secondary-100
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textBlock: {
    flexDirection: 'column',
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  flexGrow: {
    flex: 1,
  },
  amountBlock: {
    alignItems: 'flex-end',
  },
  usdValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tokenAmount: {
    fontSize: 12,
    color: '#888',
  },
  swapAmount: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  swapSubAmount: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
  },
});
