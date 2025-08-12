import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import { ArrowSquareOut, CopySimple, CheckCircle } from 'phosphor-react-native';
import {
  SelectedNetwork,
  sliceAddress,
  STAKE_MODE,
  useDualStaking,
  useFeatureFlags,
  useGetExplorerTxnUrl,
  usePendingTxState,
  useSelectedNetwork,
  sliceWord,
} from '@leapwallet/cosmos-wallet-hooks';
import { isBabylon, Provider, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators';
import { RootBalanceStore, RootStakeStore } from '@leapwallet/cosmos-wallet-store';
import { Buttons, GenericCard, Header, ThemeName, useTheme } from '@leapwallet/leap-ui';

import PopupLayout from '../../components/layout/popup-layout';
import { LoaderAnimation } from '../../components/loader/Loader';
import Text from '../../components/text';
import { PageName } from '../../services/config/analytics';
import { useActiveChain } from '../../hooks/settings/useActiveChain';
import { Images } from '../../../assets/images';
import { GenericLight } from '../../../assets/images/logos';
import { Colors } from '../../theme/colors';

import { TxSuccessEpochDurationMessage } from './components/TxSuccessEpochDurationMessage';
import { DeliverTxResponse, isDeliverTxSuccess } from '@cosmjs/stargate';

// ------------ Types -------------
export type StakeTxnPageState = {
  validator: Validator;
  provider: Provider;
  mode: STAKE_MODE | 'CLAIM_AND_DELEGATE';
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
};

type StakeTxnPageProps = {
  rootBalanceStore: RootBalanceStore;
  rootStakeStore: RootStakeStore;
};

// ------------ Main Component -------------
const StakeTxnPage = observer(({ rootBalanceStore, rootStakeStore }: StakeTxnPageProps) => {
  // Navigation & Route
  const navigation = useNavigation();
  const route = useRoute<any>();

  // Parse state from route params or fallback (session storage is web, not available)
  const {
    validator,
    mode,
    forceChain,
    forceNetwork,
    provider,
  }: StakeTxnPageState = useMemo(() => {
    return route.params as StakeTxnPageState;
  }, [route.params]);

  const _activeChain = useActiveChain();
  const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);

  const _selectedNetwork = useSelectedNetwork();
  const selectedNetwork = useMemo(() => forceNetwork || _selectedNetwork, [_selectedNetwork, forceNetwork]);

  const { pendingTx, setPendingTx } = usePendingTxState();
  const [txHash, setTxHash] = useState<string | undefined>('');
  const [amount, setAmount] = useState<string | number | undefined>('');
  const [copied, setCopied] = useState(false);
  const imageUrl = validator?.image;

  const { data: featureFlags } = useFeatureFlags();
  const { refetchDelegations: refetchProviderDelegations } = useDualStaking();

  const invalidateBalances = useCallback(() => {
    rootBalanceStore.refetchBalances(activeChain, selectedNetwork);
  }, [activeChain, rootBalanceStore, selectedNetwork]);

  const invalidateDelegations = useCallback(() => {
    rootStakeStore.updateStake(activeChain, selectedNetwork, true);
  }, [activeChain, rootStakeStore, selectedNetwork]);

  const { theme } = useTheme();

  useEffect(() => {
    setTxHash(pendingTx?.txHash);
  }, [pendingTx?.txHash]);

  useEffect(() => {
    if (pendingTx && pendingTx.promise) {
      pendingTx.promise
        .then(
          (result) => {
            if (result && isDeliverTxSuccess(result as DeliverTxResponse)) {
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
          invalidateBalances();
          invalidateDelegations();
          if (activeChain === 'lava' && featureFlags?.restaking.extension === 'active') {
            refetchProviderDelegations();
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const txStatusText = useMemo(() => ({
    CLAIM_REWARDS: {
      loading: 'claiming rewards',
      success: 'claimed successfully',
      failed: 'failed claiming',
      submitted: 'claim submitted',
    },
    DELEGATE: {
      loading: 'staking',
      success: 'staked successfully',
      failed: 'failed staking',
      submitted: 'stake submitted',
    },
    UNDELEGATE: {
      loading: 'unstaking',
      success: 'unstaked successfully',
      failed: 'failed unstaking',
      submitted: 'unstake submitted',
    },
    CANCEL_UNDELEGATION: {
      loading: 'cancelling unstake',
      success: 'unstake cancelled successfully',
      failed: 'failed cancelling unstake',
      submitted: 'cancel undelegation submitted',
    },
    REDELEGATE: {
      loading: `switching ${provider ? 'provider' : 'validator'}`,
      success: `${provider ? 'provider' : 'validator'} switched successfully`,
      failed: `failed switching ${provider ? 'provider' : 'validator'}`,
      submitted: 'redelegation submitted',
    },
    CLAIM_AND_DELEGATE: {
      loading: 'claiming and staking rewards',
      success: 'claimed and staked successfully',
      failed: 'failed claiming and staking',
      submitted: 'claim and delegate submitted',
    },
  }), [provider]);

  const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({
    forceChain: activeChain,
    forceNetwork: selectedNetwork,
    forceTxHash: txHash,
  });

  useEffect(() => {
    let _amount =
      mode === 'CLAIM_REWARDS' || mode === 'UNDELEGATE' ? pendingTx?.receivedUsdValue : pendingTx?.sentUsdValue;
    if (_amount === '-') {
      _amount = mode === 'CLAIM_REWARDS' || mode === 'UNDELEGATE' ? pendingTx?.receivedAmount : pendingTx?.sentAmount;
    }
    setAmount(_amount);
  }, [mode, pendingTx?.receivedAmount, pendingTx?.receivedUsdValue, pendingTx?.sentAmount, pendingTx?.sentUsdValue]);

  const handleCopyClick = () => {
    if (txHash) {
      Clipboard.setString(txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --------- Main Render ---------
  return (
    <PopupLayout>
      <Header title={`Transaction ${txStatusStyles[pendingTx?.txStatus ?? 'loading'].title}`} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.cardContainer}>
          <View style={styles.iconWrapper}>
            {pendingTx?.txStatus === 'loading' && <LoaderAnimation color='#29a874' style={styles.iconImage} />}
            {pendingTx?.txStatus === 'success' && (
              <Image source={{uri: Images.Activity.TxSwapSuccess}} style={styles.iconImage} resizeMode="contain" />
            )}
            {pendingTx?.txStatus === 'failed' && (
              <Image source={{uri: Images.Activity.TxSwapFailure}} style={styles.iconImage} resizeMode="contain" />
            )}
          </View>
          <View style={styles.amountStatusWrapper}>
            <Text size="lg" style={styles.amountText}>{amount as string}</Text>
            <Text size="sm" style={styles.statusText}>
              {txStatusText[mode]?.[pendingTx?.txStatus ?? 'loading']}
            </Text>
          </View>
          <View style={styles.chipRow}>
            {validator && (
              <View style={styles.chip}>
                <Image
                  source={{ uri: imageUrl ?? validator?.image ?? Images.Misc.Validator }}
                  style={styles.avatar}
                  onError={() => GenericLight}
                />
                <Text size="sm" style={styles.chipText}>
                  {sliceWord(
                    validator?.moniker,
                    10, // adjust for screen size if needed
                    0,
                  )}
                </Text>
              </View>
            )}
            {provider && (
              <View style={styles.chip}>
                <Image
                  source={{uri: Images.Misc.Validator}}
                  style={styles.avatar}
                  onError={() => GenericLight}
                />
                <Text size="sm" style={styles.chipText}>
                  {sliceWord(
                    provider.moniker,
                    10,
                    0,
                  )}
                </Text>
              </View>
            )}
          </View>
        </View>

        {!!txHash && (
          <GenericCard
            isRounded
            title={
              <Text size="sm" style={styles.txIdTitle}>
                Transaction ID
              </Text>
            }
            subtitle={
              <Text size="md" style={styles.txIdSubtitle}>
                {sliceAddress(txHash)}
              </Text>
            }
            style={styles.txCard}
            size="md"
            icon={
              <View style={styles.txIcons}>
                <TouchableOpacity
                  onPress={handleCopyClick}
                  disabled={copied}
                  style={[styles.iconButton, copied && { opacity: 0.8 }]}
                >
                  {copied ? (
                    <CheckCircle size={18} weight="fill" color={Colors.green500} />
                  ) : (
                    <CopySimple size={16} color={theme === ThemeName.DARK ? Colors.white100 : Colors.black100} />
                  )}
                </TouchableOpacity>
                {txnUrl && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => Linking.openURL(txnUrl)}
                  >
                    <ArrowSquareOut size={16} color={theme === ThemeName.DARK ? Colors.white100 : Colors.black100} />
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}

        {pendingTx?.txStatus === 'success' && isBabylon(activeChain) && (
          <TxSuccessEpochDurationMessage mode={mode as STAKE_MODE} />
        )}

        <View style={styles.footerBtns}>
          <Buttons.Generic
            onClick={() => navigation.navigate('Home')}
            size="normal"
            color={theme === ThemeName.DARK ? Colors.gray800 : Colors.gray200}
            style={styles.footerBtn}
          >
            <Text style={{ color: theme === ThemeName.DARK ? Colors.white100 : Colors.black100 }}>Home</Text>
          </Buttons.Generic>
          <Buttons.Generic
            onClick={() => {
              if (mode === 'DELEGATE') {
                navigation.goBack();
              } else {
                navigation.navigate('Stake', { pageSource: PageName.StakeTxnPage });
              }
            }}
            color={
              pendingTx?.txStatus === 'failed' || mode === 'DELEGATE'
                ? Colors.green600
                : theme === ThemeName.DARK
                ? Colors.white100
                : Colors.black100
            }
            size="normal"
            style={styles.footerBtn}
            disabled={pendingTx?.txStatus === 'loading'}
          >
            <Text
              style={{
                color:
                  pendingTx?.txStatus === 'failed' || mode === 'DELEGATE'
                    ? Colors.white100
                    : Colors.white100,
              }}
            >
              {pendingTx?.txStatus === 'failed' ? 'Retry' : mode === 'DELEGATE' ? 'Stake Again' : 'Done'}
            </Text>
          </Buttons.Generic>
        </View>
      </ScrollView>
    </PopupLayout>
  );
});

// ------------ Styles -------------
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 40,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconWrapper: {
    height: 100,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 75,
    height: 75,
    alignSelf: 'center',
  },
  amountStatusWrapper: {
    alignItems: 'center',
    marginVertical: 8,
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: 22,
    color: '#111',
  },
  statusText: {
    fontSize: 15,
    color: '#111',
    textAlign: 'center',
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 4,
  },
  chipText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
  },
  txCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
  },
  txIdTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#222',
  },
  txIdSubtitle: {
    color: '#888',
    fontWeight: '500',
    fontSize: 16,
  },
  txIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  footerBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    justifyContent: 'space-between',
  },
  footerBtn: {
    flex: 1,
    marginHorizontal: 4,
  },
});

const txStatusStyles = {
  loading: {
    title: 'In Progress...',
  },
  success: {
    title: 'Complete',
  },
  submitted: {
    title: 'Submitted',
  },
  failed: {
    title: 'Failed',
  },
};

export default StakeTxnPage;
