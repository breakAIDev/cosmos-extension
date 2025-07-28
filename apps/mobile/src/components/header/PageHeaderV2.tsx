import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

type PageHeaderProps = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
};

export const PageHeader: React.FC<PageHeaderProps> = ({ children, style }) => {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
};

PageHeader.displayName = 'PageHeader';

const styles = StyleSheet.create({
  header: {
    position: 'absolute', // or use 'relative' if preferred
    top: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
    backgroundColor: 'rgba(240,240,240,0.75)', // Simulates `bg-secondary-100/75`
    backdropFilter: 'blur(10px)', // For Web. If you're on native: skip or use a blur view lib
  },
});
