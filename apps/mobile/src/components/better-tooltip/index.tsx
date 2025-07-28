import React, { useState, useRef } from 'react';
import { View, Modal, Text, Pressable, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';

type TooltipProps = {
  children: React.ReactElement;
  content: React.ReactNode;
  style?: any;
};

const Tooltip: React.FC<TooltipProps> = ({ children, content, style }) => {
  const [visible, setVisible] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(true);
  };

  const hideTooltip = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setVisible(false), 250); // mimic web delay
  };

  return (
    <>
      <Pressable
        onPressIn={showTooltip}
        onPressOut={hideTooltip}
        onLongPress={showTooltip}
      >
        {children}
      </Pressable>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay}>
            <View style={[styles.tooltip, style]}>
              <Text style={styles.tooltipText}>{content}</Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    // Center the tooltip for demo; for real, position relative to child.
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)', // subtle dim
  },
  tooltip: {
    minWidth: 200,
    maxHeight: Dimensions.get('window').height * 0.4,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  tooltipText: {
    color: '#222',
    fontSize: 15,
  },
});

export default Tooltip;
