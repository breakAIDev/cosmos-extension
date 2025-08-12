import React, { ReactNode, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ViewStyle, StyleProp } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomModalProps = {
  isOpen: boolean;
  title: string;
  titleComponent?: ReactNode;
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
  disableClose?: boolean;
  onActionButtonClick?: () => void;
  hideActionButton?: boolean;
  actionButton?: ReactNode;
  secondaryActionButton?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  wrapperStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

const BottomModal: React.FC<BottomModalProps> = ({
  isOpen,
  title,
  titleComponent,
  closeOnBackdropClick = true,
  onClose,
  disableClose,
  onActionButtonClick,
  hideActionButton,
  actionButton,
  secondaryActionButton,
  children,
}) => {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  // Only two snap points: closed (0) and content height
  const snapPoints = useMemo(() => ['CONTENT_HEIGHT'], []);

  // Handle sheet close (swipe down or backdrop tap)
  const handleClose = useCallback(() => {
    if (!disableClose) {
      onClose?.();
    }
  }, [disableClose, onClose]);

  // Open/close programmatically
  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={isOpen ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={!disableClose}
      onClose={handleClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.3}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={closeOnBackdropClick ? 'close' : 'none'}
        />
      )}
      keyboardBlurBehavior="restore"
      // adjust these as needed
      style={styles.sheet}
      handleStyle={styles.handle}
    >
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          {React.isValidElement(secondaryActionButton) ? (secondaryActionButton) : (<View />)}
          {React.isValidElement(titleComponent) ? (
            titleComponent
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}
          {!hideActionButton && (
            actionButton ? (
              <View style={styles.actionButton}>{React.isValidElement(actionButton) ? (actionButton) : (<View />)}</View>
            ) : (
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={onActionButtonClick ?? handleClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            )
          )}
        </View>
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {React.isValidElement(children) ? (children) : (<View />)}
        </ScrollView>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    // optional: shadow and rounding for modal look
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 24,
    elevation: 12,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    backgroundColor: 'transparent'
  },
  handle: {
    // optional: hide or customize the drag handle
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  secondaryButton: {
    position: 'absolute',
    left: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  closeIcon: {
    position: 'absolute',
    right: 20,
    top: Platform.OS === 'ios' ? 0 : 4,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    height: 36,
  },
  closeText: {
    fontSize: 26,
    color: '#6B7280',
  },
  actionButton: {
    position: 'absolute',
    right: 20,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  content: {
    padding: 28,
    maxHeight: 400, // adjust as needed
  },
});

export default BottomModal;
