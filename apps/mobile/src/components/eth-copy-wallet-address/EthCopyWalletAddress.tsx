import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { Images } from '../../../assets/images';

type EthCopyWalletAddressProps = {
  walletAddresses?: string[];
  onCopy?: () => void;
  color: string;
  textOnCopied?: string;
  copyIcon?: any; // local image asset (require)
  onTextClick?: () => void;
  style?: object;
};

export function EthCopyWalletAddress({
  walletAddresses,
  color,
  onCopy,
  textOnCopied = 'Copied',
  copyIcon,
  onTextClick,
  style,
}: EthCopyWalletAddressProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme(); // << Use Leap's theme system

  const text = copied ? textOnCopied : walletAddresses?.[0] ?? '';
  const copyIconSrc =
    theme === ThemeName.DARK ? Images.Misc.CopyGray200 : Images.Misc.CopyGray600;

  // Clipboard usage
  const handleCopy = async () => {
    if (!text) {
      // Optionally handle missing address
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    try {
      await Clipboard.setString(text);
    } catch (e) {}
    if (onCopy) await onCopy();
  };

  const handleTextPress = () => {
    if (onTextClick) onTextClick();
  };

  const handlePress = () => {
    if (onTextClick) {
      handleTextPress();
    } else {
      handleCopy();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        copied
          ? { backgroundColor: color }
          : theme === ThemeName.DARK
          ? styles.darkButton
          : styles.lightButton,
        copied ? styles.buttonCopied : styles.buttonNormal,
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        {copied && (
          <View style={styles.copiedIcon}>
            {/* Replace this with your actual CopiedSvg if needed */}
            <Image source={Images.Misc.CopySvg} style={{ width: 18, height: 18, tintColor: 'white' }} />
          </View>
        )}
        <View
          style={[
            styles.textWrapper,
            !copied ? { marginRight: 10 } : { marginLeft: 6 },
          ]}
        >
          <Text
            style={[
              styles.text,
              copied
                ? { color: '#fff', fontWeight: 'bold' }
                : theme === ThemeName.DARK
                ? { color: '#E5E7EB', fontWeight: '500' }
                : { color: '#374151', fontWeight: '500' },
            ]}
            numberOfLines={1}
            ellipsizeMode="middle"
            onPress={handleTextPress}
          >
            {text}
          </Text>
          {(walletAddresses?.length ?? 1) > 1 && !copied && (
            <View style={styles.multiBadge}>
              <Text style={styles.multiBadgeText}>+{(walletAddresses?.length ?? 1) - 1}</Text>
            </View>
          )}
        </View>
        {!copied && (
          <TouchableOpacity
            style={styles.copyIconWrapper}
            onPress={onTextClick ? handleCopy : undefined}
            activeOpacity={0.7}
          >
            <Image
              source={copyIcon ?? copyIconSrc}
              style={{ width: 20, height: 20, tintColor: theme === ThemeName.DARK ? '#E5E7EB' : '#6B7280' }}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 120,
    alignSelf: 'center',
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  lightButton: {
    backgroundColor: '#fff',
  },
  darkButton: {
    backgroundColor: '#111827',
  },
  buttonCopied: {
    borderRadius: 56,
    paddingLeft: 21,
    paddingRight: 25,
  },
  buttonNormal: {
    borderRadius: 30,
    paddingLeft: 16,
    paddingRight: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedIcon: {
    marginRight: 8,
  },
  textWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    lineHeight: 20,
  },
  multiBadge: {
    marginLeft: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: 'center',
  },
  multiBadgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  copyIconWrapper: {
    marginLeft: 8,
  },
});
