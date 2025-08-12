import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import { CheckCircle } from 'phosphor-react-native'; // Or use a compatible RN icon
import { CopySvg, FilledDownArrowSvg } from '../../../assets/images/misc'; // Use RN SVG or Image equivalents
import { sliceWord } from '../../utils/strings';

type WalletButtonProps = {
  showWalletAvatar?: boolean;
  giveCopyOption?: boolean;
  handleCopyClick?: () => void;
  walletName: string;
  showDropdown?: boolean;
  handleDropdownClick?: () => void;
  walletAvatar?: string;
  isAddressCopied?: boolean;
};

export const WalletButton = React.memo(
  ({
    showWalletAvatar,
    giveCopyOption,
    handleCopyClick,
    walletName,
    showDropdown,
    handleDropdownClick,
    walletAvatar,
    isAddressCopied,
  }: WalletButtonProps) => {
    // Animation for the Copied! overlay
    const [copiedAnim] = React.useState(new Animated.Value(0));
    React.useEffect(() => {
      if (isAddressCopied) {
        Animated.timing(copiedAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      } else {
        copiedAnim.setValue(0);
      }
    }, [isAddressCopied]);

    return (
      <View style={styles.container}>
        <View style={styles.innerRow}>
          <TouchableOpacity
            style={[
              styles.walletBtn,
              giveCopyOption && styles.withBorder,
              handleDropdownClick ? styles.clickable : null,
            ]}
            onPress={handleDropdownClick}
            activeOpacity={handleDropdownClick ? 0.7 : 1}
          >
            {showWalletAvatar && walletAvatar ? (
              <Image source={{ uri: walletAvatar }} style={styles.avatar} />
            ) : null}

            <Text
              numberOfLines={1}
              style={styles.walletName}
              // accessibilityLabel={walletName}
            >
              {sliceWord(walletName, 8, 0)}
            </Text>

            {showDropdown && (
              <View style={{marginLeft: 4}}>
                <FilledDownArrowSvg />
              </View>
            )}
          </TouchableOpacity>

          {giveCopyOption ? (
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={!isAddressCopied ? handleCopyClick : undefined}
              activeOpacity={isAddressCopied ? 1 : 0.7}
            >
              <CopySvg />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Copied Overlay */}
        {isAddressCopied && (
          <Animated.View
            style={[
              styles.copiedOverlay,
              { opacity: copiedAnim }
            ]}
            pointerEvents="none"
          >
            <CheckCircle weight="fill" size={24} color="#fff" style={{marginRight: 4}} />
            <Text style={styles.copiedText}>Copied!</Text>
          </Animated.View>
        )}
      </View>
    );
  }
);

WalletButton.displayName = 'WalletButton';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6', // gray-100
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    overflow: 'hidden',
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 2,
    flex: 1,
  },
  clickable: {
    // Optional, for touch feedback
  },
  withBorder: {
    borderRightWidth: 1,
    borderColor: '#F3F4F6', // gray-100
  },
  avatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  walletName: {
    color: '#111827',
    fontSize: 14,
    fontWeight: 'bold',
    maxWidth: 96,
    lineHeight: 19.6,
    flexShrink: 1,
  },
  copyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copiedOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#16A34A', // green-600
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  copiedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
