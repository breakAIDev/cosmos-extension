import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, useColorScheme, DeviceEventEmitter } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useActiveChain, useActiveWallet, useChainInfo, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { BtcTx } from '@leapwallet/cosmos-wallet-sdk';
import { BtcWallet } from '@leapwallet/leap-keychain';
import { Avatar, Buttons, Header } from '@leapwallet/leap-ui';
import assert from 'assert';
import { ErrorCard } from '../../../components/ErrorCard';
import PopupLayout from '../../../components/layout/popup-layout';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { MessageTypes } from '../../../services/config/message-types';
import { useSiteLogo } from '../../../hooks/utility/useSiteLogo';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { Images } from '../../../../assets/images';
import { Colors, getChainColor } from '../../../theme/colors';
import { TransactionStatus } from '../../../types/utility';
import { formatWalletName } from '../../../utils/formatWalletName';
import { trim } from '../../../utils/strings';
import { useHandleRejectClick } from '../utils';  // Implement RN version

const useGetWallet = Wallet.useGetWallet;

type SignMessageProps = {
  txnData: Record<string, any>;
};

export function SignMessage({ txnData }: SignMessageProps) {
  const getWallet = useGetWallet();
  const navigation = useNavigation();
  const activeChain = useActiveChain();
  const chainInfo = useChainInfo(activeChain);
  const activeWallet = useActiveWallet();
  const {setHandleRejectClick} = useHandleRejectClick();

  assert(activeWallet !== null, 'activeWallet is null');
  const walletName = useMemo(() => formatWalletName(activeWallet.name), [activeWallet.name]);
  const siteOrigin = txnData?.origin as string | undefined;
  const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2);
  const siteLogo = useSiteLogo(siteOrigin);

  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [signingError, setSigningError] = useState<string | null>(null);

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
        throw new Error('Ledger transactions are not supported yet');
      }

      setSigningError(null);
      setTxStatus('loading');

      const wallet = (await getWallet(activeChain)) as unknown as BtcWallet;
      let signature: string = '';

      if (txnData.signTxnData.type === 'bip322-simple') {
        signature = BtcTx.SignBIP322SimpleMessage(txnData.signTxnData.message, wallet);
      }
      if (txnData.signTxnData.type === 'ecdsa') {
        signature = await BtcTx.SignECDSA(txnData.signTxnData.message, wallet);
      }

      DeviceEventEmitter.emit(
        MessageTypes.signBitcoinResponse,
        {payloadId: txnData?.payloadId,status: 'success', data: signature  }
      );

      setTxStatus('success');
      navigation.goBack();
    } catch (error) {
      setTxStatus('error');
      setSigningError((error as Error).message);
    }
  };

  const isApproveBtnDisabled = !!signingError || txStatus === 'loading';

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>
        <PopupLayout
          header={
            <View style={styles.headerWrap}>
              <Header
                imgSrc={chainInfo.chainSymbolImageUrl || Images.Logos.GenericLight}
                title={
                  <Buttons.Wallet title={trim(walletName, 10)} style={{ paddingRight: 16 }} />
                }
              />
            </View>
          }
        >
          <ScrollView
            style={[styles.scroll, { height: messagePanelHeight }]}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <Text style={[styles.title, { color: textColor }]}>Signature request</Text>
            <Text style={[styles.desc, { color: subTextColor }]}>
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

            <ScrollView
              horizontal
              style={styles.messageBlock}
              contentContainerStyle={{ flexGrow: 1 }}
              showsHorizontalScrollIndicator
            >
              <Text
                style={[styles.messageText, { color: textColor, backgroundColor: bgColor }]}
                selectable
              >
                {txnData.signTxnData.message}
              </Text>
            </ScrollView>

            {signingError && txStatus === 'error' ? (
              <ErrorCard text={signingError} style={{ marginTop: 12 }} />
            ) : null}
          </ScrollView>

          <View style={[styles.footerPanel, { backgroundColor: isDark ? '#18181b' : '#F9FAFB' }]}>
            <View style={styles.buttonRow}>
              <Buttons.Generic
                title='Reject Button'
                color={Colors.gray900}
                onClick={() => setHandleRejectClick(txnData?.payloadId)}
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
  outer: {
    width: 400,
    height: '100%',
    position: 'relative',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  inner: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#fff',
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
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    width: '100%',
    marginBottom: 4,
  },
  desc: {
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
