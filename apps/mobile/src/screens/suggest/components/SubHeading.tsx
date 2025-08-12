import React from 'react';
import Text from '../../../components/text';
import { StyleSheet } from 'react-native';
import { Colors } from '../../../theme/colors';

type SubHeadingProps = {
  text: string;
};

export function SubHeading({ text }: SubHeadingProps) {
  return (
    <Text
      size="xs"
      style={styles.subHeading}
      color={Colors.gray800} // You can swap based on theme
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  subHeading: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 2, // mt-[2px]
    maxWidth: 250,
    marginBottom: 8, // mb-2
  },
});
