import { ActivityCardContent, ActivityType } from '@leapwallet/cosmos-wallet-hooks';
import { SKIP_TXN_STATUS, TXN_STATUS } from '@leapwallet/elements-core';
import BottomModal from 'components/bottom-modal';
import { ActivityCard } from 'pages/activity/components/ActivityCard';
import React, { Dispatch, SetStateAction } from 'react';
import { TxStoreObject } from 'utils/pendingSwapsTxsStore';

const SKIP_TERMINAL_STATES = [
  SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS,
  SKIP_TXN_STATUS.STATE_COMPLETED_ERROR,
  SKIP_TXN_STATUS.STATE_ABANDONED,
  TXN_STATUS.FAILED,
  TXN_STATUS.SUCCESS,
];

type Props = {
  pendingSwapTxs?: TxStoreObject[];
  setShowSwapTxPageFor: Dispatch<SetStateAction<TxStoreObject | undefined>>;
  isOpen: boolean;
  onClose: () => void;
};

function PendingSwapsSheet({ isOpen, onClose, pendingSwapTxs, setShowSwapTxPageFor }: Props) {
  return (
    <BottomModal
      title='Pending Transactions'
      onClose={onClose}
      isOpen={isOpen}
      closeOnBackdropClick={true}
      contentClassName='!bg-white-100 dark:!bg-gray-950'
      className='p-6'
    >
      <div className='flex flex-col justify-start w-full items-start gap-[16px]'>
        {pendingSwapTxs?.map((swapTx, index) => {
          let subtitle = 'Swap in progress';
          if (swapTx.state && [SKIP_TXN_STATUS.STATE_COMPLETED_SUCCESS, TXN_STATUS.SUCCESS].includes(swapTx.state)) {
            subtitle = 'Transaction Successful';
          }
          if (swapTx.state && [SKIP_TXN_STATUS.STATE_COMPLETED_ERROR, TXN_STATUS.FAILED].includes(swapTx.state)) {
            subtitle = 'Transaction Failed';
          }
          // @ts-expect-error TODO: fix this
          if (swapTx.state && [SKIP_TXN_STATUS.STATE_ABANDONED].includes(swapTx.state)) {
            subtitle = 'Cannot Track';
          }

          const content = {
            txType: 'swap' as ActivityType,
            title1: `${swapTx.sourceToken?.symbol} → ${swapTx.destinationToken?.symbol}`,
            subtitle1: subtitle,
            img: swapTx.sourceToken?.img,
            secondaryImg: swapTx.destinationToken?.img,
            sentAmount: swapTx.inAmount,
            receivedAmount: swapTx.amountOut,
            sentTokenInfo: { coinDenom: swapTx.sourceToken?.symbol },
            receivedTokenInfo: { coinDenom: swapTx.destinationToken?.symbol },
          } as ActivityCardContent;

          return (
            <React.Fragment key={`${swapTx.inAmount}-${index}`}>
              <ActivityCard
                showLoader={!swapTx.state || !SKIP_TERMINAL_STATES.includes(swapTx.state)}
                content={content}
                onClick={() => {
                  setShowSwapTxPageFor(swapTx);
                  onClose();
                }}
                isSuccessful={true}
                containerClassNames='w-full'
              />
            </React.Fragment>
          );
        })}
      </div>
    </BottomModal>
  );
}

export default PendingSwapsSheet;
