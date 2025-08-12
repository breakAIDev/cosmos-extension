import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, GestureResponderEvent, ViewStyle, StyleProp } from 'react-native';

type SecondaryActionButtonProps = {
  onPress: (e?: GestureResponderEvent) => void;
  leftIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  actionLabel?: string;
} & React.PropsWithChildren<any>;

export const SecondaryActionButton: React.FC<SecondaryActionButtonProps> = ({
  leftIcon = null,
  onPress,
  style,
  children,
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.7}>
      {React.isValidElement(leftIcon) ? leftIcon : <View/>}
      <Text style={styles.label}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC', // gray-50
  },
  icon: {
    marginRight: 4,
  },
  label: {
    color: '#1A202C', // text-black-100 or adjust as needed
    fontSize: 16,
  },
});
