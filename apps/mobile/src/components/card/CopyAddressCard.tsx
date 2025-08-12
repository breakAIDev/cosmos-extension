import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
// Use your own SVG/icon components for Check and CopySvg
import { CheckCircle } from 'phosphor-react-native'; // Replace with react-native icon
import { CopySvg } from '../../../assets/images/misc';    // Replace with your RN-compatible SVG/icon
import { sliceAddress, useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { useDefaultTokenLogo } from '../../hooks';

type CopyAddressCardProps = {
  forceChain?: SupportedChain;
  address: string;
  showDifferentIconForButton?: boolean;
  DifferentIconToShow?: React.ReactNode;
  differentIconButtonStyle?: any;
  differentIconButtonOnClick?: () => void;
  forceName?: string;
};

export const CopyAddressCard = React.memo(
  ({
    forceChain,
    address,
    showDifferentIconForButton,
    DifferentIconToShow,
    differentIconButtonStyle,
    differentIconButtonOnClick,
    forceName,
  }: CopyAddressCardProps) => {
    const chains = useGetChains();
    const _activeChain = useActiveChain();
    const activeChain = useMemo(() => forceChain || _activeChain, [_activeChain, forceChain]);
    const activeChainInfo = chains[activeChain];
    const defaultTokenLogo = useDefaultTokenLogo();
    const [isCopied, setIsCopied] = useState(false);

    const name = useMemo(() => {
      if (forceName) return forceName;
      let _name = activeChainInfo?.chainName;
      if (address.toLowerCase().startsWith('0x')) _name = `${_name} (EVM)`;
      return _name;
    }, [activeChainInfo?.chainName, address, forceName]);

    const handleCopyClick = useCallback(() => {
      setIsCopied(true);
      Clipboard.setString(address);
      setTimeout(() => setIsCopied(false), 2000);
    }, [address]);

    // For animation you can use Animated.Value if needed

    return (
      <View style={styles.card}>
        <View style={styles.left}>
          <Image
            source={activeChainInfo?.chainSymbolImageUrl
              ? { uri: activeChainInfo.chainSymbolImageUrl }
              : defaultTokenLogo
            }
            onError={() => defaultTokenLogo}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.infoCol}>
            <Text style={styles.chainName} numberOfLines={1}>{name}</Text>
            <Text style={styles.address} numberOfLines={1}>
              {address.includes(', ') ? address : sliceAddress(address, 5)}
            </Text>
          </View>
        </View>

        {showDifferentIconForButton ? (
          <TouchableOpacity
            onPress={differentIconButtonOnClick}
            style={[styles.button, styles.differentBtn, differentIconButtonStyle]}
          >
            {DifferentIconToShow}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              isCopied ? styles.buttonCopied : styles.buttonDefault,
            ]}
            disabled={isCopied}
            onPress={isCopied ? undefined : handleCopyClick}
            activeOpacity={isCopied ? 1 : 0.7}
          >
            {isCopied ? (
              // Replace with your RN Check icon
              <CheckCircle weight="fill" size={20} color="#16A34A" />
            ) : (
              <CopySvg width={20} height={20} color="#8F9CA9" />
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  }
);

CopyAddressCard.displayName = 'CopyAddressCard';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: '#F5F7FB', // secondary-100
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    marginVertical: 4,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  infoCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
  },
  chainName: {
    fontWeight: 'bold',
    color: '#222B45',
    fontSize: 16,
    lineHeight: 22,
  },
  address: {
    color: '#505A63', // secondary-800
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 19,
    letterSpacing: 0.2,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginLeft: 6,
  },
  buttonDefault: {
    backgroundColor: '#E9EEF7', // secondary-200
    borderColor: '#E9EEF7',
  },
  buttonCopied: {
    backgroundColor: 'rgba(16, 185, 129, 0.10)', // accent-green/10
    borderColor: 'rgba(16, 185, 129, 0.40)', // accent-green/40
  },
  differentBtn: {
    backgroundColor: '#E9EEF7',
    borderColor: '#E9EEF7',
  },
});
