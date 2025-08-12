import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useColorScheme, Image, DeviceEventEmitter, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import BigNumber from 'bignumber.js';
import { useActiveChain, useActiveWallet, useAddress, useChainInfo, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { BtcTx } from '@leapwallet/cosmos-wallet-sdk';
import { NETWORK, TEST_NETWORK } from '@scure/btc-signer';
import { Images } from '../../../../assets/images';
import { Colors, getChainColor } from '../../../theme/colors';
import { ErrorCard } from '../../../components/ErrorCard';
import PopupLayout from '../../../components/layout/popup-layout';
import { LoaderAnimation } from '../../../components/loader/Loader';
import { useHandleRejectClick } from '../utils';
import { RootDenomsStore } from '@leapwallet/cosmos-wallet-store';
import { Wallet } from '../../../hooks/wallet/useWallet';
import { formatWalletName } from '../../../utils/formatWalletName';
import { useSiteLogo } from '../../../hooks/utility/useSiteLogo';
import { hex } from '@scure/base';
import { Buttons } from '@leapwallet/leap-ui';
import { trim } from 'viem';
const useGetWallet = Wallet.useGetWallet;

type SignPsbtProps = {
  txnData: Record<string, any>;
  rootDenomsStore: RootDenomsStore;
  isRedirected?: boolean;
  handleBack?: () => void;
};

export const SignPsbt = observer(({ txnData, rootDenomsStore, isRedirected, handleBack }: SignPsbtProps) => {
  const getWallet = useGetWallet();
  const navigation = useNavigation();
  const activeChain = useActiveChain();
  const chainInfo = useChainInfo(activeChain);
  const activeWallet = useActiveWallet();
  const { setHandleRejectClick } = useHandleRejectClick();

  if (!activeWallet) throw new Error('activeWallet is null');

  const walletName = useMemo(() => formatWalletName(activeWallet.name), [activeWallet.name]);
  const siteOrigin = txnData?.origin as string | undefined;
  const siteName = siteOrigin?.split('//')?.at(-1)?.split('.')?.at(-2);
  const siteLogo = useSiteLogo(siteOrigin);

  const details = useMemo(() => (
    BtcTx.GetPsbtHexDetails(
      txnData.signTxnData.psbtHex,
      activeChain === 'bitcoinSignet' ? TEST_NETWORK : NETWORK,
    )
  ), [activeChain, txnData.signTxnData.psbtHex]);

  const denomInfo = useMemo(() => (
    rootDenomsStore.allDenoms[Object.keys(chainInfo.nativeDenoms)[0]]
  ), [chainInfo.nativeDenoms, rootDenomsStore.allDenoms]);

  const address = useAddress();
  const [txStatus, setTxStatus] = useState('idle');
  const [signingError, setSigningError] = useState<string | null>(null);

  const handleSignClick = async () => {
    try {
      if (activeWallet.walletType === WALLETTYPE.LEDGER) throw new Error('Ledger transactions are not supported yet');
      const options = txnData.signTxnData.options;
      const autoFinalized = options && options.autoFinalized === false ? false : true;

      setSigningError(null);
      setTxStatus('loading');

      const wallet = (await getWallet(activeChain)) as any;
      details.inputs.forEach((input, index) => {
        if (input.tapScriptInfo) {
          const tapScriptInfo = input.tapScriptInfo;
          details.tx.updateInput(index, {
            tapMerkleRoot: tapScriptInfo.merklePath,
            tapScriptSig: tapScriptInfo.controlBlock,
            tapInternalKey: tapScriptInfo.internalKey,
            tapLeafScript: tapScriptInfo.scriptTree,
          });
        }
        wallet.signIdx(address, details.tx, index);
      });

      if (autoFinalized) {
        for (let i = 0; i < details.inputs.length; i++) {
          details.tx.finalizeIdx(i);
        }
        details.tx.extract();
      }

      const signedTxHex = hex.encode(details.tx.toPSBT());
      setTxStatus('success');

      // Replace with DeviceEventEmitter, native bridge, or your backend
      DeviceEventEmitter.emit('signBitcoinResponse', { status: 'success', data: signedTxHex });

      navigation.goBack();
    } catch (error) {
      setTxStatus('error');
      setSigningError((error as Error).message);
    }
  };

  const isApproveBtnDisabled = !!signingError || txStatus === 'loading';

  // Colors/dark mode
  const isDark = useColorScheme() === 'dark';
  const textColor = isDark ? '#F9FAFB' : '#111827';
  const bgColor = isDark ? '#18181b' : '#fff';
  const subTextColor = isDark ? '#D1D5DB' : '#6B7280';

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
              <TouchableOpacity
                onPress={isRedirected ? handleBack : undefined}
              >
                <Image source={{uri: chainInfo.chainSymbolImageUrl ?? Images.Logos.GenericLight}}/>

                <Buttons.Wallet
                  title={trim(walletName, 10)}
                  style={{ paddingRight: 16 }}
                />
              </TouchableOpacity>
            </View>
          }
        >
          <ScrollView
            style={[
              styles.scrollContainer,
              isRedirected ? { height: 500 } : { height: 450 }
            ]}
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            <Text style={[styles.headerText, { color: textColor }]}>
              {isRedirected ? 'Transaction Details' : 'Sign Transaction'}
            </Text>

            {!isRedirected && (
              <Text style={[styles.subText, { color: subTextColor }]}>
                Only sign this transaction if you fully understand the content and trust the requesting site
              </Text>
            )}

            {!isRedirected && (
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
            )}

            {details?.txAmount && (
              <View style={styles.amountPanel}>
                <Text style={[styles.label, { color: textColor }]}>Amount</Text>
                <ScrollView horizontal style={styles.preBlock}>
                  <Text style={styles.preText}>
                    {`${new BigNumber(Number(details.txAmount))
                      .dividedBy(10 ** (denomInfo.coinDecimals ?? 8))
                      .toNumber()} ${chainInfo.denom}`}
                  </Text>
                </ScrollView>
              </View>
            )}

            {details?.fee && (
              <View style={styles.amountPanel}>
                <Text style={[styles.label, { color: textColor }]}>Fee</Text>
                <ScrollView horizontal style={styles.preBlock}>
                  <Text style={styles.preText}>
                    {`${new BigNumber(Number(details.fee))
                      .dividedBy(10 ** (denomInfo.coinDecimals ?? 8))
                      .toNumber()} ${chainInfo.denom}`}
                  </Text>
                </ScrollView>
              </View>
            )}

            {details?.inputs?.length ? (
              <View style={styles.amountPanel}>
                <Text style={[styles.label, { color: textColor }]}>Inputs</Text>
                <ScrollView horizontal style={styles.preBlock}>
                  <Text style={styles.preText}>
                    {JSON.stringify(
                      details.inputs,
                      (key, value) => {
                        if (key === 'tapScriptInfo') return;
                        if (typeof value === 'bigint') {
                          return `${new BigNumber(Number(value))
                            .dividedBy(10 ** (denomInfo.coinDecimals ?? 8))
                            .toNumber()} ${chainInfo.denom}`;
                        }
                        return value;
                      },
                      2,
                    )}
                  </Text>
                </ScrollView>
              </View>
            ) : null}

            {details?.outputs?.length ? (
              <View style={styles.amountPanel}>
                <Text style={[styles.label, { color: textColor }]}>Outputs</Text>
                <ScrollView horizontal style={styles.preBlock}>
                  <Text style={styles.preText}>
                    {JSON.stringify(
                      details.outputs,
                      (_, value) => {
                        if (typeof value === 'bigint') {
                          return `${new BigNumber(Number(value))
                            .dividedBy(10 ** (denomInfo.coinDecimals ?? 8))
                            .toNumber()} ${chainInfo.denom}`;
                        }
                        return value;
                      },
                      2,
                    )}
                  </Text>
                </ScrollView>
              </View>
            ) : null}

            {signingError && txStatus === 'error' ? (
              <ErrorCard text={signingError} style={{ marginTop: 12 }} />
            ) : null}
          </ScrollView>

          {!isRedirected && (
            <View style={styles.footerPanel}>
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
                  {txStatus === 'loading'
                    ? <LoaderAnimation color='white' />
                    : 'Sign'}
                </Buttons.Generic>
              </View>
            </View>
          )}
        </PopupLayout>
      </View>
    </View>
  );
});

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
  scrollContainer: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    position: 'relative',
    // height set dynamically
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
  amountPanel: {
    marginTop: 12,
  },
  label: {
    fontWeight: '600',
    paddingLeft: 4,
    marginBottom: 4,
  },
  preBlock: {
    backgroundColor: '#fff',
    padding: 16,
    width: '100%',
    borderRadius: 16,
    marginTop: 4,
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
    backgroundColor: '#F9FAFB',
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 12,
  },
  button: {
    // shared button styles, if any
  },
  disabledButton: {
    opacity: 0.5,
  },
});