import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { AnimatePresence, MotiView } from 'moti';
import { Images } from '../../../assets/images';

const DisclosureContainer = ({
  children,
  title,
  style,      // Not used in this version, but you could map this to styles if needed
  leftIcon,
  initialOpen = false,
}: {
  children: React.ReactNode;
  title: string;
  leftIcon?: string;
  style?: StyleProp<ViewStyle>;
  initialOpen?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggle = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={toggle} activeOpacity={0.7}>
        {leftIcon ? (
          <Image source={typeof leftIcon === 'string' ? { uri: leftIcon } : leftIcon} style={styles.leftIcon} />
        ) : null}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.arrowContainer}>
          <Image
            source={{uri: Images.Misc.DownArrow}}
            style={[
              styles.arrow,
              isOpen && { transform: [{ rotate: '180deg' }] },
            ]}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
      <AnimatePresence>
        {isOpen ? (
          <MotiView
            from={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'timing', duration: 250 }}
            style={[styles.content, style]}
          >
            {React.isValidElement(children) ? children : <View/>}
          </MotiView>
        ) : null}
      </AnimatePresence>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    backgroundColor: '#f8fafc', // Light bg; use '#111827' for dark mode if you implement
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  leftIcon: {
    marginRight: 8,
    height: 20,
    width: 20,
  },
  title: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
  arrowContainer: {
    padding: 8,
    marginLeft: 'auto',
  },
  arrow: {
    width: 20,
    height: 20,
  },
  content: {
    overflow: 'hidden',
  },
});

export default DisclosureContainer;
