import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { HappyFrog } from '../../../../assets/icons/frog';

interface EmptyBookmarksProps {
  title: string;
  subTitle: string | React.ReactNode;
  style?: any;
  showRetryButton?: boolean;
}

export default function EmptyBookmarks({ title, subTitle, style }: EmptyBookmarksProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      style={[styles.container, style]}
    >
      <HappyFrog style={styles.frogIcon} />

      <Text style={styles.title}>{title}</Text>
      {typeof subTitle === 'string' ? (
        <Text style={styles.subTitle}>{subTitle}</Text>
      ) : (
        React.isValidElement(subTitle) ? subTitle : null
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F3F4F6', // secondary-100
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 54,   // 3.375rem
    paddingBottom: 60, // 3.75rem
    paddingHorizontal: 20, // px-5
    borderRadius: 20,
    textAlign: 'center',
    gap: 8,
  },
  frogIcon: {
    width: 80, // size-20
    height: 80,
    marginBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    textAlign: 'center',
    color: '#222',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#97A3B9', // muted-foreground
    lineHeight: 20,
    paddingHorizontal: 32, // px-11 (approximate)
  },
});
