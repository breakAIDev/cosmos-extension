import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomModal from '../bottom-modal'; // assumed to be adapted for React Native
import RadarAnimation from '../loader/Radar'; // assumed to be a Lottie or RN animation
import Text from '../text'; // assumed RN wrapper

type Props = {
  showLedgerPopup: boolean;
  onClose: () => void;
};

export default function LedgerConfirmationModal({ showLedgerPopup, onClose }: Props) {
  return (
    <BottomModal isOpen={showLedgerPopup} onClose={onClose} title="Confirm on Ledger">
      <View style={styles.container}>
        <View style={styles.animation}>
          <RadarAnimation />
        </View>
        <Text size="md" style={styles.text}>
          Approve transaction on your hardware wallet
        </Text>
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  animation: {
    marginVertical: 40,
  },
  text: {
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
  },
});
