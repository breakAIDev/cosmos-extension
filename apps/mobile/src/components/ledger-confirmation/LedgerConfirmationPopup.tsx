import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomModal from '../bottom-modal'; // React Native-compatible modal
import RadarAnimation from '../loader/Radar'; // assumed to be an animation component (Lottie or SVG)
import Text from '../text'; // RN-compatible styled text component

type Props = {
  showLedgerPopup: boolean;
  onCloseLedgerPopup?: () => void;
  showLedgerPopupText?: string;
};

export default function LedgerConfirmationPopup({
  showLedgerPopup,
  onCloseLedgerPopup,
  showLedgerPopupText,
}: Props) {
  const onClose = () => {
    // Placeholder function
  };

  return (
    <BottomModal
      isOpen={showLedgerPopup}
      onClose={onCloseLedgerPopup ?? onClose}
      title="Confirm on Ledger"
    >
      <View style={styles.container}>
        <View style={styles.animation}>
          <RadarAnimation />
        </View>
        <Text size="md" style={styles.text}>
          {showLedgerPopupText || 'Approve transaction on your hardware wallet'}
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
    marginVertical: 28,
  },
  text: {
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
  },
});
