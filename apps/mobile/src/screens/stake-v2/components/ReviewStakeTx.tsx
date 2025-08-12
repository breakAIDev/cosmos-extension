import {
  formatTokenAmount,
  sliceWord,
  STAKE_MODE,
  Token,
  useformatCurrency,
  useValidatorImage,
} from '@leapwallet/cosmos-wallet-hooks';
import { Provider, Validator } from '@leapwallet/cosmos-wallet-sdk';
import { Info } from 'phosphor-react-native';
import BigNumber from 'bignumber.js';
import LedgerConfirmationPopup from '../../../components/ledger-confirmation/LedgerConfirmationPopup';
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { Images } from '../../../../assets/images';
import { GenericLight } from '../../../../assets/images/logos';
import loadingImage from '../../../../assets/lottie-files/swaps-btn-loading.json';
import Lottie from 'lottie-react';
import React, { useMemo } from 'react';

import { transitionTitleMap } from '../utils/stake-text';
import { View, Text, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import LottieView from 'lottie-react-native';

type ReviewStakeTxProps = {
  isVisible: boolean;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: () => void;
  tokenAmount: string;
  token?: Token;
  error: string | undefined;
  gasError: string | null;
  validator?: Validator;
  provider?: Provider;
  mode: STAKE_MODE;
  unstakingPeriod: string;
  showLedgerPopup: boolean;
  ledgerError: string | undefined;
};

export const getButtonTitle = (mode: STAKE_MODE, isProvider = false) => {
  switch (mode) {
    case 'DELEGATE':
      return 'Stake';
    case 'UNDELEGATE':
      return 'Unstake';
    case 'CANCEL_UNDELEGATION':
      return 'Cancel Unstake';
    case 'CLAIM_REWARDS':
      return 'Claiming';
    case 'REDELEGATE':
      return `Switching ${isProvider ? 'Provider' : 'Validator'}`;
  }
};

const ValidatorCard = (props: { title: string; subTitle: string; imgSrc?: string; style?: StyleProp<ViewStyle> }) => {
  return (
    <View style={[styles.card, props.style]}>
      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle}>{props.title}</Text>
        <Text style={styles.cardSubtitle}>{props.subTitle}</Text>
      </View>
      <Image
        source={{ uri: props.imgSrc ?? Images.Logos.GenericLight}}
        style={styles.cardImage}
        resizeMode="cover"
      />
    </View>
  );
};

export default function ReviewStakeTx({
  isVisible,
  onClose,
  onSubmit,
  tokenAmount,
  token,
  validator,
  isLoading,
  error,
  mode,
  unstakingPeriod,
  gasError,
  showLedgerPopup,
  provider,
  ledgerError,
}: ReviewStakeTxProps) {
  const [formatCurrency] = useformatCurrency();
  const { data: validatorImage } = useValidatorImage(validator?.image ? undefined : validator);
  const imageUrl = validator?.image || validatorImage || Images.Misc.Validator;

  const currentAmount = useMemo(() => {
    if (new BigNumber(token?.usdPrice ?? '').gt(0)) {
      return formatCurrency(new BigNumber(tokenAmount).times(token?.usdPrice ?? ''));
    }
    return '';
  }, [formatCurrency, token?.usdPrice, tokenAmount]);

  const anyError = ledgerError || error || gasError;

  return (
    <>
      <BottomModal
        isOpen={isVisible}
        onClose={onClose}
        title={
          <Text>
            {mode === 'REDELEGATE' && provider ? 'Review provider switching' : transitionTitleMap[mode || 'DELEGATE']}
          </Text>
        }
        style={{padding: 24, paddingTop: 32}}
      >
        <View style={modalStyles.backdrop}>
          <View style={modalStyles.sheet}>
            <ValidatorCard
              title={`${tokenAmount} ${token?.symbol}`}
              subTitle={currentAmount}
              imgSrc={token?.img}
            />
            {validator && (
              <View style={{ width: '100%' }}>
                <ValidatorCard
                  title={validator?.moniker}
                  subTitle={'Validator'}
                  imgSrc={validator?.image}
                  style={mode === 'REDELEGATE' ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}}
                />
                {mode === 'REDELEGATE' && (
                  <View style={modalStyles.infoBox}>
                    <Info size={16} color="#2563EB" style={{ marginRight: 6 }} />
                    <Text style={modalStyles.infoText}>
                      Redelegating to a new validator takes {unstakingPeriod} as funds unbond from the source validator,
                      then moved to the new one.
                    </Text>
                  </View>
                )}
              </View>
            )}
            {provider && (
              <ValidatorCard
                title={provider.moniker as string}
                subTitle={'Provider'}
                imgSrc={provider.image}
              />
            )}
            {anyError ? (
              <Text style={modalStyles.errorText}>{anyError}</Text>
            ) : null}
            <Button
              style={modalStyles.button}
              disabled={isLoading || (!!error && !ledgerError) || !!gasError}
              onPress={onSubmit}
            >
              {isLoading ? (
                <LottieView
                  source={loadingImage}
                  autoPlay
                  loop
                  style={{ height: 28, width: 28 }}
                />
              ) : (
                `Confirm ${getButtonTitle(mode, !!provider)}`
              )}
            </Button>
          </View>
        </View>
      </BottomModal>
      {showLedgerPopup && <LedgerConfirmationPopup showLedgerPopup={showLedgerPopup} />}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#F4F4F5', // bg-secondary-100
    width: '100%',
    marginBottom: 10,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontWeight: 'bold', fontSize: 18 },
  cardSubtitle: { fontSize: 14, color: '#7E869E', marginTop: 2 },
  cardImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEE', marginLeft: 8 },
});

const modalStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#DBEAFE', // blue-400/10
    borderRadius: 8,
    padding: 10,
    marginTop: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#2563EB', // blue-400
    fontWeight: '500',
    flex: 1,
  },
  button: { width: '100%', marginTop: 16 },
  errorText: { color: '#EF4444', fontSize: 13, marginTop: 10, fontWeight: 'bold' },
});