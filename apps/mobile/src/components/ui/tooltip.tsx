import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Pressable, GestureResponderEvent } from 'react-native';

type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'press' | 'longPress';
  tooltipStyle?: any;
  containerStyle?: any;
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = 'top',
  trigger = 'longPress',
  tooltipStyle,
  containerStyle,
}) => {
  const [visible, setVisible] = useState(false);

  const triggerProps =
    trigger === 'longPress'
      ? { onLongPress: () => setVisible(true) }
      : { onPress: () => setVisible(true) };

  return (
    <View style={containerStyle}>
      <TouchableOpacity activeOpacity={0.7} {...triggerProps}>
        {children}
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <View style={[
            styles.tooltip,
            placement === 'bottom' && { top: '70%' },
            tooltipStyle,
          ]}>
            <Text style={styles.text}>{content}</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltip: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderColor: '#E6EAEF',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 1000,
    maxWidth: 240,
  },
  text: {
    color: '#232323',
    fontSize: 12,
    fontWeight: '500',
  },
});
