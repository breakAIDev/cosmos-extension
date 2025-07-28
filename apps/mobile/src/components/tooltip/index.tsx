import React from 'react';
import { Modal, Text, View, StyleSheet, Dimensions, Pressable } from 'react-native';

type TooltipProps = {
  message: string;
  visible: boolean;
  onRequestClose: () => void;
};

export const Tooltip = ({ message, visible, onRequestClose }: TooltipProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onRequestClose}>
      <Pressable style={styles.overlay} onPress={onRequestClose}>
        <View style={styles.tooltip}>
          <Text style={styles.text}>{message}</Text>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center', // center vertically
    alignItems: 'center',     // center horizontally
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tooltip: {
    maxWidth: Dimensions.get('window').width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    borderColor: '#d1d5db', // Tailwind gray-300
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  text: {
    color: '#111827', // Tailwind gray-900
    fontSize: 14,
    fontWeight: '500',
  },
});
