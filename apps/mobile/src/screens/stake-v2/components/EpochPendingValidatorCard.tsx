import { sliceWord, useValidatorImage } from '@leapwallet/cosmos-wallet-hooks';
import { Validator } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { epochIntervalStore } from '../../../context/epoch-interval-store';
import { hideAssetsStore } from '../../../context/hide-assets-store';

type EpochPendingValidatorCardProps = {
  validator: Validator;
  currencyBalance?: string;
  formattedBalance?: string;
};

const EpochPendingValidatorCardView = ({
  validator,
  currencyBalance,
  formattedBalance,
}: EpochPendingValidatorCardProps) => {
  // `useValidatorImage` is a web-specific hook; replace with validator.image or static image on native
  const imageUrl = validator?.image || Images.Misc.Validator;
  const [formatCurrency] = useFormatCurrency();

  const amountTitleText = useMemo(() => {
    if (new BigNumber(currencyBalance ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(currencyBalance ?? '')));
    } else {
      return hideAssetsStore.formatHideBalance(formattedBalance ?? '');
    }
  }, [currencyBalance, formattedBalance, formatCurrency]);

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(currencyBalance ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(formattedBalance ?? '');
    }
    return '';
  }, [currencyBalance, formattedBalance]);

  return (
    <View
      style={styles.card}
    >
      <View style={styles.row}>
        <Image
          source={typeof imageUrl === 'string' ? { uri: imageUrl } : imageUrl}
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <View style={styles.left}>
            <Text style={styles.validatorName} numberOfLines={1}>
              {sliceWord(validator.moniker, 10, 3)}
            </Text>
            <Text style={styles.epochInfo}>
              Queued for unstaking in {epochIntervalStore.timeLeft}
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.amountTitle}>{amountTitleText}</Text>
            <Text style={styles.amountSubtitle}>{amountSubtitleText}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', // light theme; add logic for dark if needed
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 14,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    marginRight: 6,
  },
  right: {
    alignItems: 'flex-end',
    minWidth: 72,
  },
  validatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111', // adjust for dark mode
    marginBottom: 2,
  },
  epochInfo: {
    fontSize: 12,
    color: '#eab308', // Tailwind yellow-600
    fontWeight: '500',
  },
  amountTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  amountSubtitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export const EpochPendingValidatorCard = observer(EpochPendingValidatorCardView);
