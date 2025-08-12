import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { isDeliverTxSuccess } from '@cosmjs/stargate';
import {
  SelectedNetwork,
  useGetExplorerTxnUrl,
  usePendingTxState,
  useSelectedNetwork,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CaretRight } from 'phosphor-react-native';
import BottomModal from '../../../components/new-bottom-modal';
import { Button } from '../../../components/ui/button';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { Images } from '../../../../assets/images';
import { observer } from 'mobx-react-lite';
import { txStatusMap } from '../../stake-v2/utils/stake-text';
// import { useNavigation } from '@react-navigation/native'; // Use if you have navigation stack

type VoteTxnSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  forceChain?: SupportedChain;
  forceNetwork?: SelectedNetwork;
  refetchVote: () => Promise<any>;
};

export const VoteTxnSheet = observer(
  ({ isOpen, onClose, forceChain, forceNetwork, refetchVote }: VoteTxnSheetProps) => {
    const _activeChain = useActiveChain();
    const _selectedNetwork = useSelectedNetwork();
    const activeChain = forceChain ?? _activeChain;
    const selectedNetwork = forceNetwork ?? _selectedNetwork;
    // const navigation = useNavigation(); // Use your navigation method

    const { pendingTx, setPendingTx } = usePendingTxState();

    const { explorerTxnUrl: txnUrl } = useGetExplorerTxnUrl({
      forceChain: activeChain,
      forceNetwork: selectedNetwork,
      forceTxHash: pendingTx?.txHash,
    });

    useEffect(() => {
      if (!pendingTx?.promise) return;
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
        .catch(() => setPendingTx({ ...pendingTx, txStatus: 'failed' }))
        .finally(() => {
          refetchVote();
        });
    }, [pendingTx, pendingTx?.promise, refetchVote, setPendingTx]);

    // Handle "Home" button press (replace with your own navigation logic)
    const handleGoHome = () => {
      // navigation.navigate('Home'); // Uncomment and use your navigation
      onClose?.(); // Or fallback to close
    };

    // Handle "View transaction" link
    const handleOpenTxnUrl = () => {
      if (txnUrl) {
        Linking.openURL(txnUrl);
      }
    };

    // Status image
    let statusImage = Images.Swap.rotate;
    let statusBg = styles.statusLoading;
    if (pendingTx?.txStatus === 'success') {
      statusImage = Images.Swap.check_green;
      statusBg = styles.statusSuccess;
    }
    if (pendingTx?.txStatus === 'failed') {
      statusImage = Images.Swap.failed_circle_red;
      statusBg = styles.statusFailed;
    }

    return (
      <BottomModal
        fullScreen
        isOpen={isOpen}
        onClose={onClose}
        containerStyle={styles.modalContainer}
      >
        <View style={styles.centeredContainer}>
          <View style={styles.centeredBox}>
            <View style={styles.centeredStatus}>
              <View style={[styles.statusCircle, statusBg, pendingTx?.txStatus === 'loading' && styles.spin]}>
                <Image source={{uri: statusImage}} style={styles.statusImg} />
              </View>
            </View>
            <View style={styles.centeredTextCol}>
              <Text style={styles.statusTitle}>
                Vote {txStatusMap[pendingTx?.txStatus || 'loading']}
              </Text>
              {pendingTx?.subtitle1 && pendingTx.title1 && pendingTx.txStatus === 'success' ? (
                <Text style={styles.statusSubtitle}>
                  {pendingTx.title1} {pendingTx.subtitle1}
                </Text>
              ) : null}
            </View>
          </View>

          {txnUrl ? (
            <TouchableOpacity
              onPress={handleOpenTxnUrl}
              style={styles.viewTxnBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.viewTxnText}>View transaction</Text>
              <CaretRight size={14} color="#29A874" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.bottomBtns}>
          <Button
            variant="mono"
            style={{ flex: 1, marginRight: 10 }}
            onPress={handleGoHome}
          >
            Home
          </Button>
          <Button
            style={{ flex: 1 }}
            onPress={onClose}
            disabled={pendingTx?.txStatus === 'loading'}
          >
            {pendingTx?.txStatus === 'failed' ? 'Retry' : 'Done'}
          </Button>
        </View>
      </BottomModal>
    );
  },
);

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#f6f7fb', // secondary-50
    flex: 1,
  },
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredBox: {
    alignItems: 'center',
    gap: 40,
  },
  centeredStatus: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statusCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e9eaf5',
  },
  statusImg: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  statusLoading: {
    backgroundColor: '#e9eaf5', // secondary-200
  },
  statusSuccess: {
    backgroundColor: '#A5DFB1', // green-400
  },
  statusFailed: {
    backgroundColor: '#ffb1b1', // red-600 or your red shade
  },
  spin: {
    // Add animated spin if desired using Animated API or react-native-reanimated
  },
  centeredTextCol: {
    alignItems: 'center',
    gap: 10,
  },
  statusTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    textAlign: 'center',
    color: '#212121',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#363945',
    textAlign: 'center',
    marginHorizontal: 16,
    marginTop: 5,
  },
  viewTxnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 32,
    marginBottom: 24,
    alignSelf: 'center',
  },
  viewTxnText: {
    color: '#29A874', // accent-green
    fontWeight: '500',
    fontSize: 15,
    marginRight: 2,
  },
  bottomBtns: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginTop: 'auto',
  },
});
