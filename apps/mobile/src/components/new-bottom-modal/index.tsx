import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { X } from 'phosphor-react-native'; // Use your preferred icon library
import { DrawerClose } from '../ui/drawer';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { observer } from 'mobx-react-lite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const BottomModalClose = ({ onPress }: { onPress?: () => void }) => (
  <DrawerClose>
    <TouchableOpacity
      onPress={onPress}
      style={styles.closeBtn}
      accessibilityRole="button"
      accessibilityLabel="Close"
    >
      <X size={18} weight="bold" />
    </TouchableOpacity>
  </DrawerClose>
);

type BottomModalProps = {
  isOpen: boolean;
  title?: string | React.ReactNode;
  onClose?: () => void;
  disableClose?: boolean;
  style?: StyleProp<ViewStyle>; // Not used, but can be mapped to style
  containerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
  onActionButtonClick?: () => void;
  hideActionButton?: boolean;
  actionButton?: React.ReactNode;
  secondaryActionButton?: React.ReactNode;
  footerComponent?: React.ReactNode;
  fullScreen?: boolean;
  direction?: 'top' | 'bottom' | 'left' | 'right'; // Only 'bottom' handled here
  children?: React.ReactNode;
};

const BottomModal: React.FC<BottomModalProps> = observer(({
  isOpen,
  title,
  onClose,
  children,
  disableClose,
  style,
  containerStyle,
  contentStyle,
  headerStyle,
  actionButton,
  onActionButtonClick,
  hideActionButton,
  secondaryActionButton,
  footerComponent,
  fullScreen,
}) => {
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => [fullScreen ? '100%' : 'CONTENT_HEIGHT'], [fullScreen]);

  const handleClose = useCallback(() => {
    if (!disableClose) {
      onClose?.();
    }
  }, [disableClose, onClose]);

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
      backdropComponent={props => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.3}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={!disableClose ? 'close' : 'none'}
        />
      )}
      keyboardBlurBehavior="restore"
      style={styles.sheet}
      handleStyle={styles.handle}
    >
      <View style={[
        containerStyle,
        contentStyle,
        styles.container,
        fullScreen && { height: '100%', borderRadius: 0 },
        { paddingBottom: insets.bottom }
      ]}>
        {/* Header */}
        <View style={[styles.header, headerStyle]}>
          {/* Left: secondary action button */}
          <View style={styles.headerIcon}>
            {secondaryActionButton && React.isValidElement(secondaryActionButton) ? secondaryActionButton : <View/>}
          </View>
          {/* Center: Title */}
          {typeof title === 'string' ? (
            <Text style={styles.title}>{title}</Text>
          ) : (
            React.isValidElement(title) ? title : null
          )}
          {/* Right: close/action button */}
          {!hideActionButton ? (
            actionButton &&  actionButton ? (
              <View style={styles.headerIcon}>{React.isValidElement(actionButton) ? actionButton : <View/>}</View>
            ) : (
              <TouchableOpacity
                style={styles.headerIcon}
                onPress={onActionButtonClick ?? handleClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {/* <X size={18} weight="bold" /> */}
                <Text style={{ fontSize: 24, color: '#1F2937', fontWeight: 'bold' }}>×</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.headerIcon} />
          )}
        </View>
        {/* Content */}
        <ScrollView
          style={[styles.content, fullScreen && { maxHeight: '100%' }, style]}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {React.isValidElement(children) ? children : <View/>}
        </ScrollView>
        {/* Footer */}
        {footerComponent && React.isValidElement(footerComponent) ? (
          <View style={styles.footer}>
            {React.isValidElement(footerComponent) ? footerComponent : <View/>}
          </View>
        ) : null}
      </View>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  closeBtn: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // "ghost" style: no fill
    borderRadius: 24,
  },
  sheet: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 24,
    elevation: 12,
  },
  handle: {
    backgroundColor: 'transparent',
  },
  container: {
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    padding: 16,
    maxHeight: 400, // Adjust as needed
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    marginTop: 'auto',
  },
});

export default BottomModal;
