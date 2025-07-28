import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { sliceWord } from '@leapwallet/cosmos-wallet-hooks';

type FallbackTokenImageProps = {
  text: string;
  containerStyle?: object;
  textStyle?: object;
};

export function FallbackTokenImage({
  text,
  containerStyle,
  textStyle,
}: FallbackTokenImageProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [slicePrefixLength, setSlicePrefixLength] = useState(5);

  // Optional: Auto-shrink prefix length until text fits
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      style={styles.container && containerStyle}
      onLayout={handleContainerLayout}
      key={text}
    >
      <Text
        style={[
          styles.text,
          textStyle,
        ]}
        numberOfLines={1}
        ellipsizeMode="middle"
      >
        {sliceWord(text, slicePrefixLength, 0, '..')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 999,
    backgroundColor: '#F3F4F6', // bg-gray-100
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minWidth: 36,
    minHeight: 36,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  text: {
    color: '#111827', // text-black-100
    fontWeight: '600',
    paddingHorizontal: 2,
  },
});
