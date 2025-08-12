import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { CaretRight, X } from 'phosphor-react-native';
import { useNavigation } from '@react-navigation/native';
import { observer } from 'mobx-react-lite';
import { EARN_MODE, Token, useTxHandler } from '@leapwallet/cosmos-wallet-hooks';
import { Wallet } from '../../hooks/wallet/useWallet';
import { Images } from '../../../assets/images'; // make sure Images is RN-friendly
import { rootBalanceStore } from '../../context/root-store';
// import PopupLayout from '../../components/layout/popup-layout'; // or use a View with similar styles

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', position: 'relative' },
  closeBtn: { alignItems: 'flex-end', padding: 24 },
  iconBtn: { padding: 4 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, marginTop: 40 },
  imgCircle: {
    height: 100, width: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 30
  },
  textXL: { fontSize: 22, fontWeight: 'bold', color: '#18191A', textAlign: 'center' },
  textSm: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 12 },
  txLink: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  txLinkText: { color: '#16a34a', fontWeight: '600', fontSize: 15, marginRight: 3 },
  bottomBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#fff', zIndex: 1000
  },
  btn: {
    flex: 1, marginHorizontal: 4, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center'
  },
  btnHome: { backgroundColor: '#f7f7fa' },
  btnActive: { backgroundColor: '#16a34a' },
  btnHomeText: { color: '#18191A', fontWeight: 'bold', fontSize: 16 },
  btnActiveText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

const TxPage = observer(({
  txHash,
  onClose,
  txType,
  sourceToken,
  destinationToken,
}: {
    txHash: string;
    onClose: () => void;
    txType: EARN_MODE;
    sourceToken?: Token;
    destinationToken?: Token;
  }) => {
  const navigation = useNavigation();
  const [txStatus, setTxStatus] = useState('loading');
  const getWallet = Wallet.useGetWallet();
  const getTxHandler = useTxHandler({ forceChain: 'noble' });

  const { title, subtitle, btnText } = useMemo(() => {
    if (txType === 'deposit') {
      if (txStatus === 'loading') {
        return { title: 'Deposit in-progress...', subtitle: '', btnText: 'View details' };
      } else if (txStatus === 'success') {
        return { title: 'Deposit successful!', subtitle: 'You will now earn rewards on your deposited USDC.', btnText: 'View details' };
      } else {
        return { title: 'Deposit failed', subtitle: '', btnText: 'Try Again' };
      }
    } else if (txType === 'withdraw') {
      if (txStatus === 'loading') {
        return { title: 'Withdrawal in-progress...', subtitle: 'Your tokens are being swapped back to USDC from USDN.', btnText: 'Done' };
      } else if (txStatus === 'success') {
        return { title: 'Withdrawal successful!', subtitle: '', btnText: 'Done' };
      } else {
        return { title: 'Withdraw failed', subtitle: '', btnText: 'Try Again' };
      }
    } else {
      if (txStatus === 'loading') {
        return { title: 'Claim in-progress...', subtitle: 'Your rewards are being claimed.', btnText: 'Done' };
      } else if (txStatus === 'success') {
        return { title: 'Tokens claimed!', subtitle: '', btnText: 'Done' };
      } else {
        return { title: 'Claim failed', subtitle: '', btnText: 'Try Again' };
      }
    }
  }, [txStatus, txType]);

  const invalidateBalances = () => {
    rootBalanceStore.refetchBalances('noble');
  };

  useEffect(() => {
    async function pollForTx() {
      try {
        const wallets = await getWallet('noble');
        const txHandler = await getTxHandler(wallets);
        const res = await txHandler.pollForTx(txHash);
        if (res.code === 0) {
          setTxStatus('success');
          invalidateBalances();
        } else {
          setTxStatus('failed');
        }
      } catch (error) {
        setTxStatus('failed');
      }
    }
    if (txHash) {
      pollForTx();
    }
  }, [getTxHandler, getWallet, txHash]);

  // Helper for image and background color
  const renderTxIcon = () => {
    if (txStatus === 'loading') {
      return (
        <View style={[styles.imgCircle, { backgroundColor: '#f3f4f6' }]}>
          <Image source={{uri: Images.Swap.rotate}} style={{ width: 64, height: 64 }} resizeMode="contain" />
        </View>
      );
    }
    if (txStatus === 'success') {
      return (
        <View style={[styles.imgCircle, { backgroundColor: '#16a34a' }]}>
          <Image source={{uri: Images.Swap.check_green}} style={{ width: 64, height: 64 }} resizeMode="contain" />
        </View>
      );
    }
    if (txStatus === 'failed') {
      return (
        <View style={[styles.imgCircle, { backgroundColor: '#dc2626' }]}>
          <Image source={{uri: Images.Swap.failed_circle_red}} style={{ width: 64, height: 64 }} resizeMode="contain" />
        </View>
      );
    }
    return null;
  };

  // Navigation helpers
  const handleHome = () => {
    navigation.navigate('Home'); // Your 'Home' route
  };

  const handleAction = () => {
    if (txType === 'deposit') {
      navigation.replace('AssetDetails', {
        assetName: 'uusdn',
        tokenChain: 'noble',
        token: destinationToken,
      });
    } else if (txType === 'withdraw') {
      navigation.replace('Home');
    }
    onClose && onClose();
  };

  return (
    <View style={styles.container}>
      {/* PopupLayout */}
      {/* Close button */}
      <View style={styles.closeBtn}>
        <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
          <X size={28} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Centered Transaction status content */}
      <View style={styles.centerContent}>
        {renderTxIcon()}

        <Text style={styles.textXL}>{title}</Text>
        {!!subtitle && (
          <Text style={styles.textSm}>{subtitle}</Text>
        )}

        {txStatus !== 'loading' && (
          <TouchableOpacity
            style={styles.txLink}
            onPress={() => Linking.openURL('https://www.mintscan.io/noble/tx/' + txHash)}
          >
            <Text style={styles.txLinkText}>View transaction</Text>
            <CaretRight size={12} color="#16a34a" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom bar with buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.btn, styles.btnHome]}
          onPress={handleHome}
        >
          <Text style={styles.btnHomeText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnActive, { marginLeft: 8 }]}
          onPress={handleAction}
        >
          <Text style={styles.btnActiveText}>{btnText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default TxPage;
