import { Images } from '../../../assets/images';

import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Easing,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';

// Adjust image imports as needed
// const DownArrow = require('../../../assets/images/misc/down-arrow.png');

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DisclosureContainer = ({
  children,
  title,
  leftIcon,
  initialOpen = false,
}: {
  children: React.ReactNode;
  title: string;
  leftIcon?: any; // Use require path for RN
  initialOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  // For icon rotation
  const rotateAnim = useRef(new Animated.Value(initialOpen ? 1 : 0)).current;

  // Expand/collapse: for height animation, LayoutAnimation is simpler
  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => {
      Animated.timing(rotateAnim, {
        toValue: prev ? 0 : 1,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start();
      return !prev;
    });
  }, [rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggle} activeOpacity={0.8}>
        {leftIcon ? <Image source={leftIcon} style={styles.leftIcon} /> : null}
        <Text style={styles.title}>{title}</Text>
        <Animated.View style={[styles.arrowWrapper, { transform: [{ rotate: rotation }] }]}>
          <Image source={Images.Misc.DownArrow} style={styles.arrow} />
        </Animated.View>
      </TouchableOpacity>
      {isOpen ? (
        <View style={styles.content}>
          {children}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16, // 2xl
    padding: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF', // white-100, adjust for dark mode as needed
    // You can add conditional styling for dark mode if you use useColorScheme
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  leftIcon: {
    marginRight: 8,
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  title: {
    color: '#6B7280', // text-gray-500
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    flex: 1,
  },
  arrowWrapper: {
    padding: 8,
    marginLeft: 'auto',
  },
  arrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  content: {
    overflow: 'hidden',
    // Add more padding if needed
  },
});

export default DisclosureContainer;
