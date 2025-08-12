import React, { useState } from 'react';
import { Text as RNText, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text, { TextProps } from '../text';

type ReadMoreProps = {
  textProps: TextProps;
  children?: string;
  readMoreColor?: string;
};

export default function ReadMoreText({ children, textProps, readMoreColor }: ReadMoreProps) {
  const [isReadMore, setIsReadMore] = useState(true);
  const toggleReadMore = () => setIsReadMore(!isReadMore);

  const isTruncatable = children ? children.length > 150 : false;
  const displayedText = isReadMore && children &&  isTruncatable ? children.slice(0, 150).trim() + '...' : children;

  return (
    <View>
      <Text {...textProps}>
        {displayedText}
      </Text>
      {isTruncatable && (
        <TouchableOpacity onPress={toggleReadMore}>
          <RNText style={[styles.readMoreText, { color: readMoreColor }]}>
            {isReadMore ? 'Read more' : 'Show less'}
          </RNText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  readMoreText: {
    fontWeight: 'bold',
    marginTop: 4,
  },
});
