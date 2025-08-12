import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Buttons } from '@leapwallet/leap-ui'; // Or use your Button component
import { CaretDoubleRight } from 'phosphor-react-native';
import BottomModal from '../../../../components/new-bottom-modal';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { ChainInfos, SupportedChain, NativeDenom } from '@leapwallet/cosmos-wallet-sdk';
import { Token } from '@leapwallet/cosmos-wallet-hooks';
import { chainInfoStore } from '../../../../context/chain-infos-store';
import { Colors } from '../../../../theme/colors';

type SendToStakeModalProps = {
  isVisible: boolean;
  onClose: () => void;
  ibcDenom: Token;
  nativeDenom: NativeDenom;
};

const SendToStakeModal = observer(
  ({ isVisible, onClose, ibcDenom, nativeDenom }: SendToStakeModalProps) => {
    const defaultIconLogo = useDefaultTokenLogo();
    const chainInfos = chainInfoStore.chainInfos;
    const nativeChainName = chainInfos[nativeDenom.chain as SupportedChain];
    const navigation = useNavigation<any>();
    const { activeWallet } = useActiveWallet();

    const handleSendToStake = () => {
      const recipient = activeWallet?.addresses[nativeDenom.chain as SupportedChain];
      navigation.navigate('Send', {
        assetCoinDenom: ibcDenom.ibcDenom,
        recipient,
      });
    };

    if (!nativeChainName) return null;

    // Helper for fallback images
    const getImageSource = (img: string | undefined) => {
      if (img) return { uri: img };
      return { uri: defaultIconLogo };
    };

    return (
      <BottomModal isOpen={isVisible} onClose={onClose} title={`Stake on ${nativeChainName.chainName}`}>
        <View style={styles.container}>
          {/* Chain swap images */}
          <View style={styles.swapBox}>
            <View style={styles.tokenWrapper}>
              <Image source={getImageSource(ibcDenom.img)} style={styles.tokenImage} />
              <Image
                source={
                  ibcDenom.tokenBalanceOnChain
                    ? {
                        uri:
                          (chainInfos[ibcDenom.tokenBalanceOnChain as SupportedChain] ??
                            ChainInfos[ibcDenom.tokenBalanceOnChain as SupportedChain])
                            ?.chainSymbolImageUrl || defaultIconLogo,
                      }
                    : { uri: defaultIconLogo }
                }
                style={styles.chainLogo}
              />
            </View>
            <CaretDoubleRight size={16} color={Colors.green600} style={{ marginHorizontal: 8 }} />
            <View style={styles.tokenWrapper}>
              <Image source={getImageSource(ibcDenom.img)} style={styles.tokenImage} />
              <Image
                source={{
                  uri: nativeChainName.chainSymbolImageUrl || defaultIconLogo,
                }}
                style={styles.chainLogo}
              />
            </View>
          </View>
          {/* Info */}
          <Text style={styles.infoText}>
            Staking requires tokens to be on their native chains. Transfer your{' '}
            <Text style={styles.boldText}>{ibcDenom.symbol}</Text>
            {' '}to{' '}
            <Text style={styles.boldText}>{nativeChainName.chainName}</Text> to start staking.
          </Text>
          <Buttons.Generic
            className="w-full"
            size="normal"
            color={Colors.green600}
            onClick={handleSendToStake}
            style={styles.button}
          >
            Send to {nativeChainName.chainName}
          </Buttons.Generic>
        </View>
      </BottomModal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 18,
  },
  swapBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#ececec',
    paddingVertical: 18,
    marginBottom: 18,
  },
  tokenWrapper: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tokenImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  chainLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#222',
    position: 'absolute',
    bottom: 3,
    right: 3,
  },
  infoText: {
    color: '#333',
    fontSize: 15,
    marginBottom: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#111',
  },
  button: {
    marginTop: 8,
    width: '100%',
  },
});

export default SendToStakeModal;
