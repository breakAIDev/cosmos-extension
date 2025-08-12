import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  PropsWithChildren,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';

// Drawer Root
type DrawerProps = PropsWithChildren<{
  open: boolean;
  onClose?: () => void;
  snapPoints?: (string | number)[];
  enablePanDownToClose?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}>;

const Drawer = forwardRef<any, DrawerProps>(
  ({ open, onClose, snapPoints = [Platform.OS === 'ios' ? '60%' : '80%'], children, enablePanDownToClose = true, containerStyle }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    useImperativeHandle(ref, () => bottomSheetRef.current);

    useEffect(() => {
      if (open) {
        bottomSheetRef.current?.expand();
      } else {
        bottomSheetRef.current?.close();
      }
    }, [open]);

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={open ? 0 : -1}
        snapPoints={snapPoints}
        enablePanDownToClose={enablePanDownToClose}
        onClose={onClose}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.4}
            appearsOnIndex={0}
            disappearsOnIndex={-1}
            pressBehavior="close"
          />
        )}
        backgroundStyle={styles.sheetBg}
      >
        <View style={[styles.sheetContainer, containerStyle]}>{React.isValidElement(children) ? children : <View/>}</View>
      </BottomSheet>
    );
  }
);
Drawer.displayName = 'Drawer';

// DrawerTrigger: Not really applicable for RN, but you can use TouchableOpacity outside Drawer

// DrawerClose
export const DrawerClose = ({
  onPress,
  children,
  style,
}: {
  onPress?: () => void;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) => (
  <TouchableOpacity onPress={onPress} style={[styles.closeBtn, style]}>
    {React.isValidElement(children) ? children : <Text style={styles.closeText}>Close</Text>}
  </TouchableOpacity>
);

// DrawerOverlay: Handled by BottomSheetBackdrop, not needed explicitly

// DrawerContent
export const DrawerContent = ({
  children,
  style,
  showHandle = true,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; showHandle?: boolean }>) => (
  <View style={[styles.content, style]}>
    {showHandle && <View style={styles.handle} />}
    {React.isValidElement(children) ? children : <View/>}
  </View>
);

// DrawerHeader
export const DrawerHeader = ({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) => (
  <View style={[styles.header, style]}>{React.isValidElement(children) ? children : <View/>}</View>
);

// DrawerFooter
export const DrawerFooter = ({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) => (
  <View style={[styles.footer, style]}>{React.isValidElement(children) ? children : <View/>}</View>
);

// DrawerTitle
export const DrawerTitle = ({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) => (
  <Text style={[styles.title, style]}>{React.isValidElement(children) ? children : <View/>}</Text>
);

// DrawerDescription
export const DrawerDescription = ({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<TextStyle> }>) => (
  <Text style={[styles.description, style]}>{React.isValidElement(children) ? children : <View/>}</Text>
);

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: '#fafbfc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: 'transparent',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#d4d4d4',
    marginVertical: 8,
  },
  header: {
    paddingBottom: 8,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  footer: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 99,
    padding: 8,
  },
  closeText: {
    color: '#007aff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export { Drawer };
