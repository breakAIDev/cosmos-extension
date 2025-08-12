import React from 'react';
import {
  View,
  Text as RNText,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useChainInfo } from '@leapwallet/cosmos-wallet-hooks';
import { Header, HeaderActionType } from '@leapwallet/leap-ui';
import { CheckCircle } from 'phosphor-react-native';
import BigNumber from 'bignumber.js';
import { Images } from '../../../../assets/images'; // Update for RN asset imports
import { observer } from 'mobx-react-lite';
import { miscellaneousDataStore } from '../../../context/chain-infos-store';
import { earnFeatureShowStore } from '../../../context/earn-feature-show';
import Text from '../../../components/text'; // assuming your custom Text is cross-platform

type Props = {
  visible: boolean;
  onClose: () => void;
};

const EarnUSDNSheet = observer(({ visible, onClose }: Props) => {
  const navigation = useNavigation();
  const chainInfo = useChainInfo('noble');
  const usdnApy = parseFloat(miscellaneousDataStore.data?.noble?.usdnEarnApy) > 0
    ? new BigNumber(miscellaneousDataStore.data.noble.usdnEarnApy).multipliedBy(100).toFixed(2) + '%'
    : '-';

  const handleStartEarningClick = () => {
    onClose();
    earnFeatureShowStore.setShow('false');
    navigation.navigate('EarnUSDN'); // update with your navigation route
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <Header
            title="Earn"
            action={{
              type: HeaderActionType.BACK,
              onClick: onClose,
            }}
          />
          <View style={styles.content}>
            <View style={{ alignItems: 'center' }}>
              <View style={styles.logoRow}>
                <Image
                  source={{uri: Images.Logos.USDCLogo}}
                  style={styles.tokenLogo}
                />
                <Image
                  source={{ uri: chainInfo.chainSymbolImageUrl ?? Images.Logos.GenericDark}}
                  style={styles.chainLogo}
                />
              </View>
              <Text style={styles.title}>Earn real-time rewards with USDC</Text>
              <Text style={styles.subTitle}>
                Put your stable asset to work and earn{' '}
                <RNText style={styles.greenApy}>{usdnApy} APY</RNText>
                . effortless and simple!
              </Text>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <CheckCircle size={24} color="#16a34a" weight="fill" />
                <Text size="sm" color="text-gray-800">
                  No lock up period
                </Text>
              </View>
              <View style={styles.infoRow}>
                <CheckCircle size={24} color="#16a34a" weight="fill" />
                <Text size="sm" color="text-gray-800">
                  Real-time accumulated rewards
                </Text>
              </View>
            </View>
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.earnButton}
                onPress={handleStartEarningClick}
                activeOpacity={0.8}
              >
                <Text style={styles.earnButtonText}>Start earning now</Text>
              </TouchableOpacity>
              <Text color="text-gray-600" size="xs" style={styles.poweredBy}>
                Powered by Noble
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    minHeight: 520,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoRow: {
    flexDirection: 'row',
    width: 116,
    height: 64,
    position: 'relative',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tokenLogo: {
    width: 64,
    height: 64,
    position: 'absolute',
    left: 0,
  },
  chainLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    position: 'absolute',
    right: 0,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 18,
    marginHorizontal: 32,
  },
  subTitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    color: '#575757',
    fontWeight: '500',
  },
  greenApy: {
    color: '#16a34a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoCard: {
    marginTop: 24,
    marginBottom: 0,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    padding: 18,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  footer: {
    width: '100%',
    marginTop: 28,
    alignItems: 'center',
  },
  earnButton: {
    backgroundColor: '#16a34a',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  earnButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
  },
  poweredBy: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default EarnUSDNSheet;
