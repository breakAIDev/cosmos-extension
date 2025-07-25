import { isDeliverTxSuccess } from '@cosmjs/stargate';
import {
  SelectedNetwork,
  STAKE_MODE,
  useGetExplorerTxnUrl,
  usePendingTxState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { Provider, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators';
import { CaretRight } from '@phosphor-icons/react';
import BottomModal from 'components/new-bottom-modal';
import { Button } from 'components/ui/button';
import { useActiveChain } from 'hooks/settings/useActiveChain';
import { Images } from 'images';
import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rootBalanceStore, rootStakeStore } from 'stores/root-store';

import { txModeTitleMap } from './utils/stake-text';
import { txStatusMap } from './utils/stake-text';

export type StakeTxnPageState = {
  validator: Validator;
  provider: Provider;
  mode: STAKE_MODE | 'CLAIM_AND_DELEGATE';
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
};

type StakeTxnSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  mode?: StakeTxnPageState['mode'] | null;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
};

export const StakeTxnSheet = observer(({ isOpen, onClose, mode, forceChain, forceNetwork }: StakeTxnSheetProps) => {
  const _activeChain = useActiveChain();
  const _selectedNetwork = useSelectedNetwork();
  const activeChain = forceChain ?? _activeChain;
  const selectedNetwork = forceNetwork ?? _selectedNetwork;

  const { pendingTx, setPendingTx } = usePendingTxState();

  const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
    forceTxHash: pendingTx?.txHash,
  });

  useEffect(() => {
    if (!pendingTx?.promise) {
      return;
    }

    pendingTx.promise
      .then(
        (result) => {
          
          
          if (result && isDeliverTxSuccess(result)) {
            setPendingTx({ ...pendingTx, txStatus: 'success' });
          } else {
            setPendingTx({ ...pendingTx, txStatus: 'failed' });
          }
        },
        () => setPendingTx({ ...pendingTx, txStatus: 'failed' }),
      )
      .catch(() => {
        setPendingTx({ ...pendingTx, txStatus: 'failed' });
      })
      .finally(() => {
        rootBalanceStore.refetchBalances(activeChain, selectedNetwork);
        rootStakeStore.updateStake(activeChain, selectedNetwork, true);
      });
  }, [pendingTx?.promise]);

  return (
    <BottomModal
      fullScreen
      isOpen={isOpen}
      onClose={onClose}
      containerClassName='bg-secondary-50'
      className='h-full flex flex-col'
    >
      <div className='flex flex-col gap-6 items-center my-auto'>
        <div className='flex flex-col gap-10 items-center'>
          <div className='flex items-center justify-center'>
            {pendingTx?.txStatus === 'loading' && (
              <div className='size-[100px] p-8 rounded-full bg-secondary-200 animate-spin'>
                <img className='size-full' src={Images.Swap.Rotate} />
              </div>
            )}
            {pendingTx?.txStatus === 'success' && (
              <div className='size-[100px] p-8 rounded-full bg-green-400'>
                <img className='size-full' src={Images.Swap.CheckGreen} />
              </div>
            )}
            {pendingTx?.txStatus === 'failed' && (
              <div className='size-[100px] p-8 rounded-full bg-red-600 dark:bg-red-400'>
                <img className='size-full' src={Images.Swap.FailedRed} />
              </div>
            )}
          </div>

          <div className='flex flex-col gap-3 items-center'>
            <span className='font-bold text-[1.5rem] text-center text-foreground'>
              {txModeTitleMap[mode || 'DELEGATE']} {txStatusMap[pendingTx?.txStatus || 'loading']}
            </span>
            {pendingTx?.subtitle2 && pendingTx.txStatus === 'success' ? (
              <span className='text-sm text-secondary-800 text-center mx-6'>{pendingTx.subtitle2}</span>
            ) : null}
          </div>
        </div>

        {txnUrl ? (
          <a
            target='_blank'
            rel='noreferrer'
            href={txnUrl}
            className='flex font-medium items-center gap-1 text-sm text-accent-green hover:text-accent-green-200 transition-colors'
          >
            View transaction
            <CaretRight size={12} />
          </a>
        ) : null}
      </div>

      <div className='flex gap-x-4 mt-auto [&>*]:flex-1'>
        <Button variant={'mono'} asChild>
          <Link to='/home'>Home</Link>
        </Button>
        <Button onClick={onClose} disabled={pendingTx?.txStatus === 'loading'}>
          {pendingTx?.txStatus === 'failed' ? 'Retry' : mode === 'DELEGATE' ? 'Stake Again' : 'Done'}
        </Button>
      </div>
    </BottomModal>
  );
});
