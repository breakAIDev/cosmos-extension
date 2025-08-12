import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, StyleProp } from 'react-native';
import { WatchingWalletStrip } from '../alert-strip/WatchingWalletStrip';

type PopupLayoutProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  headerZIndex?: number;
  skipWatchingWalletHeader?: boolean;
};

export default function PopupLayout({
  children,
  header,
  style,
  headerZIndex = 2,
  skipWatchingWalletHeader = false,
}: PopupLayoutProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.header, { zIndex: headerZIndex }]}>
        {React.isValidElement(header) ? header : <View/>}
      </View>
      {React.isValidElement(header) ? header : <View style={styles.headerSpacer} />}
      {React.isValidElement(header) && !skipWatchingWalletHeader ? <WatchingWalletStrip /> : <View/>}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {React.isValidElement(children) ? children : <View/>}
      </ScrollView>
    </View>
  );
}

const HEADER_HEIGHT = 72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // gray-50
    position: 'relative',
    // Optionally set width/height for modal or panel effect
    // width: 400,
    // height: 600,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9FAFB', // gray-50
    // Dark mode support can be added if needed
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: '#E5E7EB',
    height: HEADER_HEIGHT,
    justifyContent: 'center',
  },
  headerSpacer: {
    height: HEADER_HEIGHT,
    width: '100%',
  },
  content: {
    paddingBottom: 24, // Adjust for bottom safe area or tab bar if needed
    // You can add more padding as needed
  },
});

