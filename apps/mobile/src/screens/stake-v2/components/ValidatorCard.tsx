import { useValidatorImage } from '@leapwallet/cosmos-wallet-hooks';
import { UnbondingDelegation, Validator } from '@leapwallet/cosmos-wallet-sdk';
import BigNumber from 'bignumber.js';
import { useFormatCurrency } from '../../../hooks/settings/useCurrency';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { hideAssetsStore } from '../../../context/hide-assets-store';

import { ValidatorCardView as BaseValidatorCardView } from './ValidatorCardView';

type ValidatorCardProps = {
  validator: Validator;
  onPress?: () => void;  // <-- changed to onPress for React Native
  isCancleUnstakeSupported: boolean;
  entry: UnbondingDelegation['entries'][number];
  subText?: string;
};

const ValidatorCardView = ({
  validator,
  onPress,
  entry,
  isCancleUnstakeSupported,
  subText,
}: ValidatorCardProps) => {
  const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator);
  const imageUrl = validator?.image || validatorImage || Images.Misc.Validator;
  const [formatCurrency] = useFormatCurrency();

  const amountTitleText = useMemo(() => {
    if (new BigNumber(entry.currencyBalance ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(formatCurrency(new BigNumber(entry.currencyBalance ?? '')));
    } else {
      return hideAssetsStore.formatHideBalance(entry.formattedBalance ?? '');
    }
  }, [entry.currencyBalance, entry.formattedBalance, formatCurrency]);

  const amountSubtitleText = useMemo(() => {
    if (new BigNumber(entry.currencyBalance ?? '').gt(0)) {
      return hideAssetsStore.formatHideBalance(entry.formattedBalance ?? '');
    }
    return '';
  }, [entry.currencyBalance, entry.formattedBalance]);

  return (
    <BaseValidatorCardView
      onPress={onPress} // <-- use onPress for RN
      imgSrc={imageUrl}
      moniker={validator.moniker}
      titleAmount={amountTitleText}
      subAmount={amountSubtitleText}
      disabled={!isCancleUnstakeSupported}
      subText={subText}
    />
  );
};

export const ValidatorCard = observer(ValidatorCardView);
