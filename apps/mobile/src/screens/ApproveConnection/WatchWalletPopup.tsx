import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Buttons, ThemeName, useTheme } from '@leapwallet/leap-ui';
import Text from '../../components/text';
import { Images } from '../../../assets/images';
import { Colors } from '../../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

type WatchWalletPopupProps = {
  origin: string;
  handleCancel: () => void;
};

export default function WatchWalletPopup({ handleCancel, origin }: WatchWalletPopupProps) {
  const { theme } = useTheme();
  const isDark = theme === ThemeName.DARK;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? Colors.gray900 : Colors.gray100 }]}>
      <View style={styles.centerColumn}>
        {/* Icon & Title */}
        <View style={styles.headerBox}>
          <Image source={{uri: Images.Misc.Connect}} style={{ width: 80, height: 80, resizeMode: 'contain' }} />
          <View style={styles.titleBox}>
            <Text size="lg" style={[styles.boldText, { color: isDark ? '#fff' : '#181818' }]}>{origin}</Text>
            <Text size="md" style={[styles.boldText, { color: isDark ? '#dedede' : '#424242' }]}>
              wants to connect to your wallet
            </Text>
          </View>
          <View style={styles.row}>
            <Text size="md" style={[styles.boldText, { color: Colors.green500 }]}>{origin}</Text>
            <Image source={{uri: Images.Activity.TxSwapSuccess}} style={{ width: 16, height: 16, marginLeft: 4, resizeMode: 'contain' }} />
          </View>
        </View>

        {/* Info Panel */}
        <View style={[styles.infoPanel, {
          backgroundColor: isDark ? Colors.gray800 : Colors.gray100,
          borderColor: Colors.orange500
        }]}>
          <View style={styles.relativeIconBox}>
            <Image source={{uri: Images.Misc.GreenEye}} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
            <Image
              source={{uri: Images.Activity.TxSwapFailure}}
              style={[styles.absIcon, { left: 31, top: 0 }]}
            />
          </View>
          <View style={styles.titleBox}>
            <Text size="md" style={[styles.boldText, { color: isDark ? '#dedede' : '#424242' }]}>
              You are watching this wallet.
            </Text>
            <Text size="md" style={[styles.mediumText, { color: isDark ? '#dedede' : '#424242' }]}>
              Import the wallet using your recovery phrase to manage assets and sign transactions.
            </Text>
          </View>
        </View>
      </View>

      {/* Cancel Button */}
      <View style={styles.buttonBox}>
        <Buttons.Generic
          size="normal"
          color={isDark ? Colors.gray900 : Colors.gray100}
          style={styles.button}
          onClick={handleCancel}
        >
          Cancel
        </Buttons.Generic>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    flex: 1,
    padding: 24,
    paddingBottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
  },
  centerColumn: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    width: '100%',
  },
  headerBox: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  titleBox: {
    flexDirection: 'column',
    gap: 2,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoPanel: {
    flexDirection: 'column',
    gap: 16,
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    padding: 16,
    width: '100%',
    marginTop: 8,
  },
  relativeIconBox: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  absIcon: {
    position: 'absolute',
    width: 18,
    height: 18,
  },
  boldText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mediumText: {
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonBox: {
    width: 344,
    position: 'absolute',
    bottom: 0,
    left: (SCREEN_WIDTH - 344) / 2,
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  button: {
    width: '100%',
  },
});
