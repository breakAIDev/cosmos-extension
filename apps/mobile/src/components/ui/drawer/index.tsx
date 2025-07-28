import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, GestureResponderEvent, ViewProps } from 'react-native';
import Modal from 'react-native-modal';

type DrawerProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showHandle?: boolean;
  overlayStyle?: object;
  contentStyle?: object;
  hideOverlay?: boolean;
};

export function Drawer({
  visible,
  onClose,
  children,
  showHandle = true,
  overlayStyle,
  contentStyle,
  hideOverlay,
}: DrawerProps) {
  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      backdropTransitionOutTiming={0}
      style={styles.modal}
      backdropOpacity={hideOverlay ? 0 : 0.4}
      backdropColor="#000"
      animationIn="slideInUp"
      animationOut="slideOutDown"
      useNativeDriver
      propagateSwipe
      avoidKeyboard
    >
      <View style={[styles.drawerContent, contentStyle]}>
        {showHandle && (
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>
        )}
        {children}
      </View>
    </Modal>
  );
}

type DrawerHeaderProps = {
  children: React.ReactNode;
  style?: object;
};
export function DrawerHeader({ children, style }: DrawerHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

type DrawerFooterProps = {
  children: React.ReactNode;
  style?: object;
};
export function DrawerFooter({ children, style }: DrawerFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

type DrawerTitleProps = {
  children: React.ReactNode;
  style?: object;
};
export function DrawerTitle({ children, style }: DrawerTitleProps) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

type DrawerDescriptionProps = {
  children: React.ReactNode;
  style?: object;
};
export function DrawerDescription({ children, style }: DrawerDescriptionProps) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

type DrawerCloseProps = {
  onPress: (e: GestureResponderEvent) => void;
  children?: React.ReactNode;
  style?: object;
};
export function DrawerClose({ onPress, children, style }: DrawerCloseProps) {
  return (
    <TouchableOpacity style={[styles.closeButton, style]} onPress={onPress}>
      {children || <Text style={styles.closeButtonText}>Close</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  drawerContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    minHeight: 80,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  handleBar: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
    marginBottom: 10,
  },
  header: {
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  footer: {
    paddingTop: 12,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
    marginTop: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 6,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 14,
    right: 20,
    zIndex: 2,
    padding: 6,
  },
  closeButtonText: {
    color: '#3664F4',
    fontSize: 15,
  },
});
