import { useActiveChain, useActiveWallet, useAddress, useChainInfo, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { BtcTx } from '@leapwallet/cosmos-wallet-sdk';
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { BtcWallet } from '@leapwallet/leap-keychain/dist/browser/key/btc-wallet';
import { Avatar, Buttons, Header } from '@leapwallet/leap-ui';
import { hex } from '@scure/base';
import { NETWORK, TEST_NETWORK } from '@scure/btc-signer';
import assert from 'assert';
import { ErrorCard } from '../../../components/ErrorCard';
import PopupLayout from '../../../components/layout/popup-layout';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { MessageTypes } from '../../../services/config/message-types';
import { useSiteLogo } from '../../../hooks/utility/useSiteLogo';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import React, { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Colors, getChainColor } from '../../../theme/colors';
import { TransactionStatus } from '../../../types/utility';
import { formatWalletName } from '../../../utils/formatWalletName';
import { sliceAddress, trim } from '../../../utils/strings';
import { DeviceEventEmitter, View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

import { useHandleRejectClick } from '../utils/shared-functions';
import { SignPsbt } from './SignPsbt';

const useGetWallet = Wallet.useGetWallet;

type SignPsbtsProps = {
  txnData: Record<string, any>;
  rootDenomsStore: RootDenomsStore;
};

export const SignPsbts = observer(({ txnData, rootDenomsStore }: SignPsbtsProps) => {
  const getWallet = useGetWallet();
  const navigation = useNavigation();
  const activeChain = useActiveChain();
  const chainInfo = useChainInfo(activeChain);
  const activeWallet = useActiveWallet();
  const { setHandleRejectClick } = useHandleRejectClick();

  assert(activeWallet !== null, 'activeWallet is null');
  const walletName = useMemo(() => formatWalletName(activeWallet.name), [activeWallet.name]);

  const siteOrigin = txnData?.origin as string | undefined;
  const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2);
  const siteLogo = useSiteLogo(siteOrigin);

  const details = useMemo(
    () =>
      txnData.signTxnData.psbtsHexes.map((psbtHex: string) =>
        BtcTx.GetPsbtHexDetails(psbtHex, activeChain === 'bitcoinSignet' ? TEST_NETWORK : NETWORK),
      ),
    [activeChain, txnData.signTxnData.psbtsHexes],
  );

  const address = useAddress();
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [signingError, setSigningError] = useState<string | null>(null);
  const [showDetailsForIdx, setShowDetailsForIdx] = useState<number | null>(null);

  const handleSignClick = async () => {
    try {
      if (activeWallet.walletType === WALLETTYPE.LEDGER) {
        throw new Error('Ledger transactions are not supported yet');
      }

      setSigningError(null);
      setTxStatus('loading');

      const wallet = (await getWallet(activeChain)) as unknown as BtcWallet;
      const signedTxHexes: string[] = [];

      for (const txDetails of details) {
        for (let i = 0; i < txDetails.inputs.length; i++) {
          await wallet.signIdx(address, txDetails.tx, i);
          txDetails.tx.finalizeIdx(i);
        }
        signedTxHexes.push(hex.encode(txDetails.tx.extract()));
      }

      setTxStatus('success');
      try {
        // RN: use event emitter for app-level communication
        DeviceEventEmitter.emit('bitcoinSignEvent', {
          type: MessageTypes.signBitcoinResponse,
          payloadId: txnData?.payloadId,
          payload: { status: 'success', data: signedTxHexes },
        });
      } catch {
        throw new Error('Could not send transaction to the dApp');
      }

      // Navigate home or back (choose what makes sense for your app)
      navigation.goBack();
    } catch (error) {
      setTxStatus('error');
      setSigningError((error as Error).message);
    }
  };

  const isApproveBtnDisabled = !!signingError || txStatus === 'loading';

  if (showDetailsForIdx !== null) {
    return (
      <SignPsbt
        txnData={{
          ...txnData,
          signTxnData: { psbtHex: txnData.signTxnData.psbtsHexes[showDetailsForIdx] },
        }}
        rootDenomsStore={rootDenomsStore}
        isRedirected={true}
        handleBack={() => setShowDetailsForIdx(null)}
      />
    );
  }

  return (
    <PopupLayout
      header={
        <View>
          <Image source={{uri: chainInfo.chainSymbolImageUrl ?? Images.Logos.GenericLight}}/>
          <Buttons.Wallet title={trim(walletName, 10)} style={styles.pr4} />
        </View>
      }
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Sign Multiple Transactions</Text>
        <Text style={styles.desc}>
          Only sign these transactions if you fully understand the content and trust the requesting site
        </Text>

        <View style={styles.siteRow}>
          <Avatar
            avatarImage={siteLogo}
            avatarOnError={() => {}}
            size='sm'
            style={styles.avatar}
          />
          <View style={styles.siteInfo}>
            <Text style={styles.siteName}>{siteName}</Text>
            <Text style={styles.siteOrigin}>{siteOrigin}</Text>
          </View>
        </View>

        {txnData.signTxnData.psbtsHexes.length
          ? txnData.signTxnData.psbtsHexes.map((psbtHex: string, index: number) => (
              <View style={styles.txItem} key={`${psbtHex}--${index}`}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txIndex}>Transaction {index + 1}</Text>
                  <Text>{sliceAddress(psbtHex, 7)}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.viewBtn,
                    { backgroundColor: getChainColor(activeChain) },
                  ]}
                  onPress={() => setShowDetailsForIdx(index)}
                >
                  <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            ))
          : null}

        {signingError && txStatus === 'error' ? (
          <ErrorCard text={signingError} style={styles.errorCard} />
        ) : null}
      </ScrollView>

      <View style={styles.actionBar}>
        <Buttons.Generic
          title="Reject"
          color={Colors.gray900}
          onClick={() => setHandleRejectClick(txnData?.payloadId)}
          disabled={txStatus === 'loading'}
        >
          Reject
        </Buttons.Generic>

        <Buttons.Generic
          title="Approve"
          color={getChainColor(activeChain)}
          onClick={handleSignClick}
          disabled={isApproveBtnDisabled}
          style={isApproveBtnDisabled ? styles.disabledBtn : undefined}
        >
          {txStatus === 'loading' ? <LoaderAnimation color='white' /> : 'Sign'}
        </Buttons.Generic>
      </View>
    </PopupLayout>
  );
});

// ---- Styles ----
const styles = StyleSheet.create({
  pr4: { paddingRight: 16 },
  scrollView: {
    padding: 16,
    paddingBottom: 120,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },
  desc: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  siteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  siteInfo: { marginLeft: 12 },
  siteName: {
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: '#222',
    fontSize: 16,
  },
  siteOrigin: {
    fontSize: 12,
    color: '#888',
    textTransform: 'lowercase',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    marginTop: 8,
    elevation: 1,
  },
  txIndex: { fontWeight: 'bold', color: '#222' },
  viewBtn: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 10,
  },
  viewBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#eee',
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    zIndex: 1,
  },
  errorCard: { marginTop: 12 },
  disabledBtn: {
    opacity: 0.5,
  },
});
