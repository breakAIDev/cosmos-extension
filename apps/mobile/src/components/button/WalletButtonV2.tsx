import React from 'react';
import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { sliceWord } from '../../utils/strings';

type WalletButtonProps = {
  showWalletAvatar?: boolean;
  walletName: string;
  showDropdown?: boolean;
  handleDropdownClick?: () => void;
  walletAvatar?: string;
  style?: any; // Optional style prop for parent override
};

export const WalletButtonV2 = React.memo(
  ({
    showWalletAvatar,
    walletName,
    showDropdown,
    handleDropdownClick,
    walletAvatar,
    style,
  }: WalletButtonProps) => {
    return (
      <TouchableOpacity
        onPress={handleDropdownClick}
        activeOpacity={handleDropdownClick ? 0.7 : 1}
        style={[styles.button, handleDropdownClick ? styles.clickable : null, style]}
      >
        {showWalletAvatar && walletAvatar ? (
          <Image
            source={{ uri: walletAvatar }}
            style={styles.avatar}
            resizeMode="cover"
          />
        ) : null}

        <Text
          numberOfLines={1}
          style={styles.walletName}
        >
          {sliceWord(walletName, 8, 0)}
        </Text>

        {showDropdown ? (
          <View style={styles.caretDown}>
            <Text style={{ fontSize: 14, color: '#7A7A7A', marginLeft: 2 }}>▼</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  }
);

WalletButtonV2.displayName = 'WalletButtonV2';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#F5F7FB', // secondary-200
    borderRadius: 999,
    paddingHorizontal: 14, // px-3.5
    paddingVertical: 6, // py-1.5
    // Optional: add transition/animation for backgroundColor with TouchableOpacity feedback
  },
  clickable: {
    // Optionally style if clickable
  },
  avatar: {
    width: 24, // size-6
    height: 24,
    borderRadius: 12,
    marginRight: 4,
  },
  walletName: {
    flexShrink: 1,
    fontSize: 14, // text-sm
    fontWeight: 'bold',
    maxWidth: 96,
    color: '#111827',
  },
  caretDown: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
