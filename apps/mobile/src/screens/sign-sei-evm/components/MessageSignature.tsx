import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Image, DeviceEventEmitter } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useActiveWallet, useChainsStore, useLastEvmActiveChain, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { ETHEREUM_METHOD_TYPE } from '@leapwallet/cosmos-wallet-provider/dist/provider/types';
import { LeapLedgerSignerEth, personalSign, signTypedData } from '@leapwallet/cosmos-wallet-sdk';
import { EthWallet } from '@leapwallet/leap-keychain';
import { Avatar, Buttons } from '@leapwallet/leap-ui';
import assert from 'assert';
import { ErrorCard } from '../../../components/ErrorCard';
import PopupLayout from '../../../components/layout/popup-layout';
import LedgerConfirmationModal from '../../../components/ledger-confirmation/confirmation-modal';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { SEI_EVM_LEDGER_ERROR_MESSAGE } from '../../../services/config/constants';
import { MessageTypes } from '../../../services/config/message-types';
import { useDefaultTokenLogo } from '../../../hooks';
import { useSiteLogo } from '../../../hooks/utility/useSiteLogo';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { Colors, getChainColor } from '../../../theme/colors';
import { TransactionStatus } from '../../../types/utility';
import { formatWalletName } from '../../../utils/formatWalletName';
import { trim } from '../../../utils/strings';
import { useHandleRejectClick } from '../utils';
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
  const {setHandleRejectClick} = useHandleRejectClick();

  const activeWallet = useActiveWallet();
  const navigation = useNavigation();

  assert(activeWallet !== null, 'activeWallet is null');
  const walletName = useMemo(() => formatWalletName(activeWallet.name), [activeWallet.name]);
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

  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const subTextColor = isDark ? '#D1D5DB' : '#6B7280';
  const bgColor = isDark ? '#18181b' : '#fff';

  // Responsive height
  const baseHeight = 600;
  const messagePanelHeight = baseHeight - 150;

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

      const wallet = (await getWallet(activeChain, true)) as EthWallet | LeapLedgerSignerEth;
      let signature: string;

      if (txnData.signTxnData.methodType === ETHEREUM_METHOD_TYPE.ETH__SIGN_TYPED_DATA_V4) {
        signature = await signTypedData(txnData.signTxnData.data, activeWallet.addresses[activeChain], wallet);
      } else {
        signature = await personalSign(txnData.signTxnData.data, activeWallet.addresses[activeChain], wallet);
      }

      // Send to dApp: use your RN event system here (e.g., DeviceEventEmitter, native bridge, or API call)
      try {
        await DeviceEventEmitter.emit('messageSignature', {
          type: MessageTypes.signSeiEvmResponse,
          payloadId: txnData?.payloadId,
          payload: { status: 'success', data: signature },
        });
      } catch {
        throw new Error('Could not send transaction to the dApp');
      }
      setTxStatus('success');
      if (!donotClose) {
       navigation.goBack();
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
    <View style={[
      styles.outerPanel,
      { marginTop: 8 },
    ]}>
      <View style={[
        styles.innerPanel,
      ]}>
        <PopupLayout
          header={
            <View style={styles.headerWrap}>
              <Image source={{uri: chainInfo?.chainSymbolImageUrl || defaultImage}}/>
              <Buttons.Wallet title={trim(walletName, 10)} style={{ paddingRight: 16 }}/>
            </View>
          }
        >
          <ScrollView
            style={[styles.scroll, { height: messagePanelHeight }]}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <Text style={[styles.headerText, { color: textColor }]}>
              Signature request
            </Text>
            <Text style={[styles.subText, { color: subTextColor }]}>
              Only sign this message if you fully understand the content and trust the requesting site
            </Text>

            <View style={[styles.sitePanel, { backgroundColor: bgColor }]}>
              <Avatar
                avatarImage={siteLogo}
                avatarOnError={() => {}}
                size='sm'
                style={styles.avatar}
              />
              <View style={{ marginLeft: 12 }}>
                <Text style={[styles.siteName, { color: textColor }]}>{siteName}</Text>
                <Text style={[styles.siteOrigin, { color: subTextColor }]}>{siteOrigin}</Text>
              </View>
            </View>

            {txnData.signTxnData.details.Message && typeof txnData.signTxnData.details.Message !== 'object' ? (
              <ScrollView horizontal style={styles.messageBlock} contentContainerStyle={{ flexGrow: 1 }}>
                <Text style={[styles.messageText, { color: textColor, backgroundColor: bgColor }]}>
                  {txnData.signTxnData.details.Message}
                </Text>
              </ScrollView>
            ) : (
              <ScrollView horizontal style={styles.preBlock} contentContainerStyle={{ flexGrow: 1 }}>
                <Text style={[styles.preText, { color: textColor, backgroundColor: bgColor }]}>
                  {JSON.stringify(
                    txnData.signTxnData.details,
                    (_, value) => (typeof value === 'bigint' ? value.toString() : value),
                    2,
                  )}
                </Text>
              </ScrollView>
            )}

            {signingError && txStatus === 'error' ? (
              <ErrorCard text={signingError} style={{ marginTop: 12 }} />
            ) : null}

            {txStatus !== 'error' && showLedgerPopup ? (
              <LedgerConfirmationModal showLedgerPopup={showLedgerPopup} onClose={() => setShowLedgerPopup(false)} />
            ) : null}
          </ScrollView>

          <View style={[styles.footerPanel, { backgroundColor: isDark ? '#18181b' : '#F9FAFB' }]}>
            <View style={styles.buttonRow}>
              <Buttons.Generic
                title='Reject Button'
                color={Colors.gray900}
                onClick={() => setHandleRejectClick(txnData?.payloadId, donotClose)}
                disabled={txStatus === 'loading'}
                style={styles.button}
              >
                Reject
              </Buttons.Generic>
              <Buttons.Generic
                title='Approve Button'
                color={getChainColor(activeChain)}
                onClick={handleSignClick}
                disabled={isApproveBtnDisabled}
                style={[
                  styles.button,
                  isApproveBtnDisabled && styles.disabledButton,
                ]}
              >
                {txStatus === 'loading' ? <LoaderAnimation color='white' /> : 'Sign'}
              </Buttons.Generic>
            </View>
          </View>
        </PopupLayout>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerPanel: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerPanel: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
  },
  panelHeight: {
    height: 500, // or whatever your panel-height is
  },
  headerWrap: {
    width: 396,
  },
  scroll: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    position: 'relative',
    flexGrow: 1,
  },
  headerText: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    width: '100%',
    marginBottom: 4,
  },
  subText: {
    textAlign: 'center',
    fontSize: 14,
    width: '100%',
    marginBottom: 8,
  },
  sitePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
  },
  avatar: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  siteName: {
    textTransform: 'capitalize',
    fontSize: 16,
    fontWeight: 'bold',
  },
  siteOrigin: {
    textTransform: 'lowercase',
    fontSize: 12,
    fontWeight: '500',
  },
  messageBlock: {
    backgroundColor: '#fff',
    padding: 16,
    width: '100%',
    borderRadius: 16,
    marginTop: 12,
  },
  messageText: {
    fontSize: 14,
    fontFamily: 'monospace',
    flexWrap: 'wrap',
  },
  preBlock: {
    backgroundColor: '#fff',
    padding: 16,
    width: '100%',
    borderRadius: 16,
    marginTop: 12,
  },
  preText: {
    fontSize: 12,
    fontFamily: 'monospace',
    flexWrap: 'wrap',
  },
  footerPanel: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 28,
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  button: {},
  disabledButton: {
    opacity: 0.5,
  },
});
