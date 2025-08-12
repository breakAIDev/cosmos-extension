import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ActivityCardContent, ActivityType } from '@leapwallet/cosmos-wallet-hooks';
import { SKIP_TXN_STATUS, TXN_STATUS } from '@leapwallet/elements-core';
import BottomModal from '../../components/bottom-modal'; // RN version
import { ActivityCard } from '../activity/components/ActivityCard'; // RN version
import { TxStoreObject } from '../../utils/pendingSwapsTxsStore';

const SKIP_TERMINAL_STATES = [
  SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS,
  SKIP_TXN_STATUS.STATE_COMPLETED_ERROR,
  SKIP_TXN_STATUS.STATE_ABANDONED,
  TXN_STATUS.FAILED,
  TXN_STATUS.SUCCESS,
];

type Props = {
  pendingSwapTxs?: TxStoreObject[];
  setShowSwapTxPageFor: React.Dispatch<React.SetStateAction<TxStoreObject | undefined>>;
  isOpen: boolean;
  onClose: () => void;
};

const PendingSwapsSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  pendingSwapTxs,
  setShowSwapTxPageFor,
}) => {
  return (
    <BottomModal
      title="Pending Transactions"
      isOpen={isOpen}
      onClose={onClose}
      closeOnBackdropClick={true}
      contentStyle={styles.modalContent}
      style={styles.modal}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {pendingSwapTxs?.map((swapTx, index) => {
          let subtitle = 'Swap in progress';
          if (
            swapTx.state &&
            [SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS, TXN_STATUS.SUCCESS].includes(swapTx.state)
          ) {
            subtitle = 'Transaction Successful';
          }
          if (
            swapTx.state &&
            [SKIP_TXN_STATUS.STATE_COMPLETED_ERROR, TXN_STATUS.FAILED].includes(swapTx.state)
          ) {
            subtitle = 'Transaction Failed';
          }
          // @ts-expect-error TODO: fix this
          if (swapTx.state && [SKIP_TXN_STATUS.STATE_ABANDONED].includes(swapTx.state)) {
            subtitle = 'Cannot Track';
          }

          const content: ActivityCardContent = {
            txType: 'swap' as ActivityType,
            title1: `${swapTx.sourceToken?.symbol} → ${swapTx.destinationToken?.symbol}`,
            subtitle1: subtitle,
            img: swapTx.sourceToken?.img,
            secondaryImg: swapTx.destinationToken?.img,
            sentAmount: swapTx.inAmount,
            receivedAmount: swapTx.amountOut,
            sentTokenInfo: {
              coinDenom: swapTx.sourceToken?.symbol,
              coinMinimalDenom: '',
              coinDecimals: 0,
              icon: '',
              chain: '',
              coinGeckoId: ''
            },
            receivedTokenInfo: {
              coinDenom: swapTx.destinationToken?.symbol,
              coinMinimalDenom: '',
              coinDecimals: 0,
              icon: '',
              chain: '',
              coinGeckoId: ''
            },
          };

          return (
            <ActivityCard
              key={`${swapTx.inAmount}-${index}`}
              showLoader={!swapTx.state || !SKIP_TERMINAL_STATES.includes(swapTx.state)}
              content={content}
              onClick={() => {
                setShowSwapTxPageFor(swapTx);
                onClose();
              }}
              isSuccessful={true}
              containerStyle={styles.card}
            />
          );
        })}
      </ScrollView>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#F9FAFB', // adjust for light/dark if needed
  },
  container: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    gap: 16,
    paddingVertical: 8,
  },
  card: {
    width: '100%',
    marginBottom: 16,
  },
});

export default PendingSwapsSheet;
