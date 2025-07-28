import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, ViewStyle } from 'react-native';
import RNModal from 'react-native-modal';

type BottomModalProps = {
  isOpen: boolean;
  title: string;
  titleComponent?: React.ReactNode;
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
  disableClose?: boolean;
  onActionButtonClick?: () => void;
  hideActionButton?: boolean;
  actionButton?: React.ReactNode;
  secondaryActionButton?: React.ReactNode;
  children: React.ReactNode;
  wrapperStyle?: ViewStyle; // make optional!
  containerStyle?: ViewStyle; // make optional!
  contentStyle?: ViewStyle; // make optional!
};

const BottomModal: React.FC<BottomModalProps> = ({
  isOpen,
  title,
  titleComponent,
  onClose,
  closeOnBackdropClick = true,
  disableClose,
  onActionButtonClick,
  hideActionButton,
  actionButton,
  secondaryActionButton,
  children,
  wrapperStyle = {},
  containerStyle = {},
  contentStyle = {},
}) => {
  const handleClose = () => {
    if (!disableClose) {
      onClose?.();
    }
  };

  return (
    <RNModal
      isVisible={isOpen}
      onBackdropPress={closeOnBackdropClick && !disableClose ? handleClose : undefined}
      onBackButtonPress={closeOnBackdropClick && !disableClose ? handleClose : undefined}
      style={styles.modal && wrapperStyle}
      backdropOpacity={0.2}
      swipeDirection={['down']}
      onSwipeComplete={handleClose}
      useNativeDriverForBackdrop
      propagateSwipe
    >
      <View style={[styles.container, containerStyle]}>
        <View style={styles.header && contentStyle}>
          {secondaryActionButton ? secondaryActionButton : null}

          {titleComponent ? (
            titleComponent
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}

          {!hideActionButton && (
            actionButton ? (
              actionButton
            ) : (
              <TouchableOpacity
                onPress={onActionButtonClick ?? handleClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text style={{ fontSize: 22, color: '#888' }}>×</Text>
              </TouchableOpacity>
            )
          )}
        </View>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#fafafa',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 24,
    maxHeight: Dimensions.get('window').height * 0.88,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
    position: 'relative',
    backgroundColor: '#fafafa',
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 18,
    padding: 2,
    zIndex: 2,
  },
  secondaryAction: {
    position: 'absolute',
    left: 18,
    top: 16,
    zIndex: 2,
  },
  content: {
    padding: 24,
    flexGrow: 1,
  },
});

export default BottomModal;
