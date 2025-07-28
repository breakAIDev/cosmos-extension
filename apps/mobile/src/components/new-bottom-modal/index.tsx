import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { X } from 'phosphor-react-native'; // Use phosphor-react-native instead of /ssr
import { Portal } from '@gorhom/portal'; // optional: ensures modal renders outside React tree

type BottomModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  disableClose?: boolean;
  hideActionButton?: boolean;
  actionButton?: React.ReactNode;
  secondaryActionButton?: React.ReactNode;
  footerComponent?: React.ReactNode;
  fullScreen?: boolean;
  direction?: 'bottom' | 'top'; // not used directly here, just for parity
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
};

const BottomModal = ({
  isOpen,
  onClose,
  title,
  children,
  disableClose = false,
  hideActionButton = false,
  secondaryActionButton,
  footerComponent,
  fullScreen = false,
  containerStyle,
  contentStyle,
}: BottomModalProps) => {
  const handleDismiss = () => {
    if (!disableClose) {
      onClose?.();
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={handleDismiss}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalContainer, fullScreen && styles.fullScreen, containerStyle]}>
          {/* Header */}
          {(title || !hideActionButton || secondaryActionButton) && (
            <View style={styles.header}>
              <View style={styles.sideAction}>{secondaryActionButton}</View>
              {typeof title === 'string' ? (
                <Text style={styles.title}>{title}</Text>
              ) : (
                title
              )}
              {!hideActionButton ? (
                <TouchableOpacity
                  onPress={handleDismiss}
                  style={styles.closeButton}
                  disabled={disableClose}
                >
                  <X size={20} weight="bold" />
                </TouchableOpacity>
              ) : (
                <View style={styles.sideAction} />
              )}
            </View>
          )}

          {/* Body */}
          <ScrollView
            contentContainerStyle={[
              styles.body,
              fullScreen && styles.fullBody,
              contentStyle,
            ]}
          >
            {children}
          </ScrollView>

          {/* Footer */}
          {footerComponent && (
            <View style={styles.footer}>{footerComponent}</View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  fullScreen: {
    borderRadius: 0,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  sideAction: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 16,
  },
  fullBody: {
    maxHeight: '100%',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f1f5f9',
  },
});

export default observer(BottomModal);
