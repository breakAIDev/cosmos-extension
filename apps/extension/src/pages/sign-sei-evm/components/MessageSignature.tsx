import { useActiveWallet, useChainsStore, useLastEvmActiveChain, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types';
import { LeapLedgerSignerEth, personalSign, signTypedData } from '@leapwallet/cosmos-wallet-sdk';
import { EthWallet } from '@leapwallet/leap-keychain';
import { Avatar, Buttons, Header } from '@leapwallet/leap-ui';
import assert from 'assert';
import classNames from 'classnames';
import { ErrorCard } from 'components/ErrorCard';
import PopupLayout from 'components/layout/popup-layout';
import LedgerConfirmationModal from 'components/ledger-confirmation/confirmation-modal';
import { LoaderAnimation } from 'components/loader/Loader';
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from 'config/constants';
import { MessageTypes } from 'config/message-types';
import { useDefaultTokenLogo } from 'hooks';
import { useSiteLogo } from 'hooks/utility/useSiteLogo';
import { Wallet } from 'hooks/wallet/useWallet';
import { Images } from 'images';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Colors } from 'theme/colors';
import { TransactionStatus } from 'types/utility';
import { formatWalletName } from 'utils/formatWalletName';
import { imgOnError } from 'utils/imgOnError';
import { isSidePanel } from 'utils/isSidePanel';
import { trim } from 'utils/strings';
import Browser from 'webextension-polyfill';

import { handleRejectClick } from '../utils';
import { SignTransactionProps } from './index';

const useGetWallet = Wallet.useGetWallet;

export type MessageSignatureProps = {
  txnData: SignTransactionProps['txnData'];
  donotClose: SignTransactionProps['donotClose'];
  handleTxnListUpdate: SignTransactionProps['handleTxnListUpdate'];
};

export function MessageSignature({ txnData, donotClose, handleTxnListUpdate }: MessageSignatureProps) {
  const lastEvmActiveChain = useLastEvmActiveChain();
  const activeChain = lastEvmActiveChain;

  const activeWallet = useActiveWallet();
  const navigate = useNavigate();

  assert(activeWallet !== null, 'activeWallet is null');
  const walletName = useMemo(() => {
    return formatWalletName(activeWallet.name);
  }, [activeWallet.name]);

  const siteOrigin = txnData?.origin as string | undefined;
  const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2);
  const siteLogo = useSiteLogo(siteOrigin);

  const getWallet = useGetWallet();
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [signingError, setSigningError] = useState<string | null>(null);
  const [showLedgerPopup, setShowLedgerPopup] = useState(false);

  const { chains } = useChainsStore();
  const chainInfo = chains[activeChain];
  const defaultImage = useDefaultTokenLogo();

  const handleSignClick = async () => {
    try {
      if (activeWallet.walletType === WALLETTYPE.LEDGER) {
        if (chainInfo?.evmOnlyChain === true) {
          setShowLedgerPopup(true);
        } else {
          throw new Error(SEI_EVM_LEDGER_ERROR_MESSAGE);
        }
      }

      setSigningError(null);
      setTxStatus('loading');

      const wallet = (await getWallet(activeChain, true)) as unknown as EthWallet | LeapLedgerSignerEth;
      let signature: string;

      if (txnData.signTxnData.methodType === ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4) {
        signature = await signTypedData(txnData.signTxnData.data, activeWallet.addresses[activeChain], wallet);
      } else {
        signature = await personalSign(txnData.signTxnData.data, activeWallet.addresses[activeChain], wallet);
      }

      try {
        await Browser.runtime.sendMessage({
          type: MessageTypes.signSeiEvmResponse,
          payloadId: txnData?.payloadId,
          payload: { status: 'success', data: signature },
        });
      } catch {
        throw new Error('Could not send transaction to the dApp');
      }

      if (!donotClose) {
        if (isSidePanel()) {
          navigate('/home');
        } else {
          window.close();
        }
      } else {
        handleTxnListUpdate();
      }
    } catch (error) {
      setTxStatus('error');
      setSigningError((error as Error).message);
    }
  };

  const isApproveBtnDisabled = !!signingError || txStatus === 'loading';

  return (
    <div
      className={classNames(
        'panel-width enclosing-panel h-full relative self-center justify-self-center flex justify-center items-center',
        { 'mt-2': !isSidePanel() },
      )}
    >
      <div
        className={classNames('relative w-full overflow-clip rounded-md border border-gray-300 dark:border-gray-900', {
          'panel-height': isSidePanel(),
        })}
      >
        <PopupLayout
          header={
            <div className='w-[396px]'>
              <Header
                imgSrc={chainInfo?.chainSymbolImageUrl || defaultImage}
                title={<Buttons.Wallet title={trim(walletName, 10)} className='pr-4 cursor-default' />}
              />
            </div>
          }
        >
          <div
            className='px-7 py-3 overflow-y-auto relative'
            style={{ height: (isSidePanel() ? window.innerHeight : 600) - 150 }}
          >
            <h2 className='text-center text-lg font-bold dark:text-white-100 text-gray-900 w-full'>
              Signature request
            </h2>

            <p className='text-center text-sm dark:text-gray-300 text-gray-500 w-full'>
              Only sign this message if you fully understand the content and trust the requesting site
            </p>

            <div className='flex items-center mt-3 rounded-2xl dark:bg-gray-900 bg-white-100 p-4'>
              <Avatar
                avatarImage={siteLogo}
                avatarOnError={imgOnError(Images.Misc.Globe)}
                size='sm'
                className='rounded-full overflow-hidden'
              />
              <div className='ml-3'>
                <p className='capitalize text-gray-900 dark:text-white-100 text-base font-bold'>{siteName}</p>
                <p className='lowercase text-gray-500 dark:text-gray-400 text-xs font-medium'>{siteOrigin}</p>
              </div>
            </div>

            {txnData.signTxnData.details.Message && typeof txnData.signTxnData.details.Message !== 'object' ? (
              <p className='text-sm break-words text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl whitespace-break-spaces'>
                {txnData.signTxnData.details.Message}
              </p>
            ) : (
              <pre className='text-xs text-gray-900 dark:text-white-100 dark:bg-gray-900 bg-white-100 p-4 w-full overflow-x-auto mt-3 rounded-2xl'>
                {JSON.stringify(
                  txnData.signTxnData.details,
                  (_, value) => (typeof value === 'bigint' ? value.toString() : value),
                  2,
                )}
              </pre>
            )}

            {signingError && txStatus === 'error' ? <ErrorCard text={signingError} className='mt-3' /> : null}

            {txStatus !== 'error' && showLedgerPopup ? (
              <LedgerConfirmationModal showLedgerPopup={showLedgerPopup} onClose={() => setShowLedgerPopup(false)} />
            ) : null}
          </div>

          <div className='absolute bottom-0 left-0 py-3 px-7 dark:bg-black-100 bg-gray-50 w-full'>
            <div className='flex items-center justify-center w-full space-x-3'>
              <Buttons.Generic
                title='Reject Button'
                color={Colors.gray900}
                onClick={() => {
                  handleRejectClick(navigate, txnData?.payloadId, donotClose);

                  if (donotClose) {
                    handleTxnListUpdate();
                  }
                }}
                disabled={txStatus === 'loading'}
              >
                Reject
              </Buttons.Generic>

              <Buttons.Generic
                title='Approve Button'
                color={Colors.getChainColor(activeChain)}
                onClick={handleSignClick}
                disabled={isApproveBtnDisabled}
                className={`${isApproveBtnDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {txStatus === 'loading' ? <LoaderAnimation color='white' /> : 'Sign'}
              </Buttons.Generic>
            </div>
          </div>
        </PopupLayout>
      </div>
    </div>
  );
}
