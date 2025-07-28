import React from 'react';
import { View, StyleSheet } from 'react-native';
import BottomModal from '../bottom-modal'; // assumed to be RN-compatible
import Text from '../text'; // assumed to be a styled RN Text wrapper

type InfoSheetProps = {
  heading: string;
  title: string;
  desc: string;
  isVisible: boolean;
  setVisible: (v: boolean) => void;
  style?: object;
};

export default function InfoSheet({
  heading,
  title,
  desc,
  isVisible,
  setVisible,
  style,
}: InfoSheetProps) {
  return (
    <BottomModal
      isOpen={isVisible}
      onClose={() => setVisible(false)}
      title={title}
      closeOnBackdropClick
      style={style}
    >
      <View style={styles.container}>
        <Text size="sm" color="text-gray-600" style={styles.heading}>
          {heading}
        </Text>
        <Text size="sm" style={styles.desc}>
          {desc}
        </Text>
      </View>
    </BottomModal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  heading: {
    fontWeight: 'bold',
    color: '#4B5563', // Tailwind's text-gray-600
  },
  desc: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
  },
});
