import React, { forwardRef } from 'react';
import {
  TouchableOpacity,
  View,
  Image,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';

export type IconButtonProps = {
  image: { src: ImageSourcePropType; alt: string };
  isFilled?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  testID?: string;
  style?: ViewStyle | ViewStyle[];
};

const IconButton = forwardRef<TouchableOpacity, IconButtonProps>(
  ({ image, isFilled, onPress, testID, style }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        testID={testID}
        style={[
          isFilled && styles.filledWrapper,
          style,
        ]}
      >
        <Image
          source={typeof image.src === 'string' ? { uri: image.src } : image.src}
          alt={image.alt}
          style={styles.iconImage}
        />
      </TouchableOpacity>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;

const styles = StyleSheet.create({
  filledWrapper: {
    width: 36,
    height: 36,
    backgroundColor: '#fff', // adapt for dark mode
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    // invert filter equivalent for dark mode should be handled by theme logic
  },
});
