import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import { DeliverTxResponse, isDeliverTxSuccess } from '@cosmjs/stargate';
import {
  SelectedNetwork,
  STAKE_MODE,
  useGetExplorerTxnUrl,
  usePendingTxState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { Provider, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators';
import { CaretRight } from 'phosphor-react-native';
import BottomModal from '../../components/new-bottom-modal';
import { Button } from '../../components/ui/button';
import { useActiveChain } from '../../hooks/settings/useActiveChain';
import { Images } from '../../../assets/images';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { rootBalanceStore, rootStakeStore } from '../../context/root-store';

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

export const StakeTxnSheet = observer(
  ({ isOpen, onClose, mode, forceChain, forceNetwork }: StakeTxnSheetProps) => {
    const navigation = useNavigation<any>();
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
      if (!pendingTx?.promise) return;

      pendingTx.promise
        .then((result) => {
          if (result && isDeliverTxSuccess(result as DeliverTxResponse)) {
            setPendingTx({ ...pendingTx, txStatus: 'success' });
          } else {
            setPendingTx({ ...pendingTx, txStatus: 'failed' });
          }
        }, () => setPendingTx({ ...pendingTx, txStatus: 'failed' }))
        .catch(() => setPendingTx({ ...pendingTx, txStatus: 'failed' }))
        .finally(() => {
          rootBalanceStore.refetchBalances(activeChain, selectedNetwork);
          rootStakeStore.updateStake(activeChain, selectedNetwork, true);
        });
    }, [pendingTx?.promise]);

    // Image and background color by status
    let statusContent;
    if (pendingTx?.txStatus === 'loading') {
      statusContent = (
        <View style={[styles.statusIcon, styles.bgSecondary200, styles.animateSpin]}>
          <Image source={{uri: Images.Swap.rotate}} style={styles.statusImg} />
        </View>
      );
    } else if (pendingTx?.txStatus === 'success') {
      statusContent = (
        <View style={[styles.statusIcon, styles.bgGreen400]}>
          <Image source={{uri: Images.Swap.check_green}} style={styles.statusImg} />
        </View>
      );
    } else if (pendingTx?.txStatus === 'failed') {
      statusContent = (
        <View style={[styles.statusIcon, styles.bgRed600]}>
          <Image source={{uri: Images.Swap.failed_circle_red}} style={styles.statusImg} />
        </View>
      );
    }

    // Action button text
    const actionText =
      pendingTx?.txStatus === 'failed'
        ? 'Retry'
        : mode === 'DELEGATE'
        ? 'Stake Again'
        : 'Done';

    // Handler for navigation to Home (uses stack navigation)
    const handleGoHome = () => {
      navigation.navigate('Home'); // Change 'Home' to your actual Home screen name
      onClose();
    };

    // Handler for explorer link
    const handleOpenUrl = async () => {
      if (txnUrl) await Linking.openURL(txnUrl);
    };

    return (
      <BottomModal
        fullScreen
        isOpen={isOpen}
        onClose={onClose}
        containerStyle={styles.modalContainer}
        contentStyle={styles.modalContent}
      >
        <View style={styles.centerContainer}>
          <View style={styles.centerTop}>
            <View style={styles.centerIcon}>{statusContent}</View>

            <View style={styles.centerTextBlock}>
              <Text style={styles.centerTitle}>
                {txModeTitleMap[mode || 'DELEGATE']}{' '}
                {txStatusMap[pendingTx?.txStatus || 'loading']}
              </Text>
              {pendingTx?.subtitle2 && pendingTx.txStatus === 'success' ? (
                <Text style={styles.centerSubtitle}>{pendingTx.subtitle2}</Text>
              ) : null}
            </View>
          </View>

          {txnUrl ? (
            <TouchableOpacity style={styles.txnLink} onPress={handleOpenUrl}>
              <Text style={styles.txnLinkText}>View transaction</Text>
              <CaretRight size={12} color="#27ae60" weight="bold" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.actionRow}>
          <Button variant="mono" onPress={handleGoHome}>
            Home
          </Button>
          <Button
            onPress={onClose}
            disabled={pendingTx?.txStatus === 'loading'}
          >
            {actionText}
          </Button>
        </View>
      </BottomModal>
    );
  }
);

// Styles (replace with your styling solution if needed)
const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#F8FAFC', // secondary-50
    flex: 1,
  },
  modalContent: {
    flex: 1,
    flexDirection: 'column',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  centerTop: {
    alignItems: 'center',
    marginBottom: 24,
  },
  centerIcon: {
    marginBottom: 20,
  },
  statusIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  statusImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  bgSecondary200: {
    backgroundColor: '#E5E7EB',
  },
  bgGreen400: {
    backgroundColor: '#4ADE80',
  },
  bgRed600: {
    backgroundColor: '#DC2626',
  },
  centerTextBlock: {
    alignItems: 'center',
    gap: 6,
  },
  centerTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    color: '#0F172A', // foreground
    marginBottom: 4,
  },
  centerSubtitle: {
    fontSize: 14,
    color: '#334155', // secondary-800
    textAlign: 'center',
    marginHorizontal: 24,
    marginTop: 2,
  },
  txnLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
  },
  txnLinkText: {
    fontSize: 14,
    color: '#27ae60', // accent-green
    fontWeight: '500',
    marginRight: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    marginHorizontal: 16,
    justifyContent: 'space-between',
  },
  animateSpin: {
    // Native spin animation would use Moti or Animated API, not a class.
    // Placeholder, apply your own animation.
  },
});

export default StakeTxnSheet;
