import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Images } from '../../../assets/images';
import { LoaderAnimation } from '../loader/Loader';
import Text from '../text'; // Assumed to be a styled RN Text wrapper

export default function LedgerConfirmationCard() {
  return (
    <View style={styles.card}>
      <Image source={Images.Misc.HardwareWallet} style={styles.icon} resizeMode="contain" />
      <Text size="md" style={styles.label}>
        Approve transaction on Ledger
      </Text>
      <LoaderAnimation color="#E18881" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 344,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff', // white-100
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  label: {
    fontWeight: 'bold',
    flexShrink: 1,
  },
  loader: {
    height: 20,
    width: 20,
    backgroundColor: '#5A3634',
    borderRadius: 999,
    marginLeft: 'auto',
  },
});
