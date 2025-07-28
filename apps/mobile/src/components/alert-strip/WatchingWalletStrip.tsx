import React from 'react';
import { View, StyleSheet } from 'react-native';
// Import your Eye icon from a compatible React Native icon set
import Icon from 'react-native-vector-icons/Feather'; // or @phosphor-icons/react-native if available
import { useTheme } from '@leapwallet/leap-ui';
import { Colors } from '../../theme/colors';
import Text from '../text';
import useActiveWallet from '../../hooks/settings/useActiveWallet';

export const WatchingWalletStrip: React.FC = () => {
  const { activeWallet } = useActiveWallet();
  const { theme } = useTheme();

  if (!activeWallet?.watchWallet) return null;

  const isDark = theme === 'dark';

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? Colors.gray950 : Colors.white100 }
    ]}>
      <Icon
        name="eye"
        size={17}
        color={isDark ? Colors.white100 : Colors.black100}
        style={{ marginRight: 8 }}
      />
      <Text size="xs" style={styles.text}>
        You are watching this wallet
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    height: 36,
    position: 'absolute', // Or 'relative', as needed
    top: 72,
    zIndex: 20,
    // paddingHorizontal: 12,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
