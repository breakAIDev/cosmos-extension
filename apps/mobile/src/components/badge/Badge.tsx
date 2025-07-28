import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type BadgeProps = {
  text: string;
  isImgRounded?: boolean; // not used in your sample
  title?: string;         // no tooltip on mobile, can be used for accessibility if desired
};

export default function Badge({ text, title }: BadgeProps) {
  return (
    <View style={styles.badgeContainer} /* accessibilityLabel={title ?? undefined} */>
      <Text
        style={styles.badgeText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // gray-100
    height: 16,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
    // You can add shadow or other effects if you like
  },
  badgeText: {
    fontSize: 10,
    color: '#1F2937', // gray-800
    fontWeight: '500',
    flexShrink: 1,
  },
});
