import React from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

type InputWithButtonProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: string; // can be require('...'), import, or { uri: ... }
  buttonIcon?: any; // optional, if you want a right-side button
  onButtonPress?: () => void; // optional
  style?: object;
  inputStyle?: object;
};

const InputWithButton: React.FC<InputWithButtonProps> = ({
  value,
  onChangeText,
  placeholder,
  icon,
  buttonIcon,
  onButtonPress,
  style,
  inputStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {icon && (
        <Image
          source={{uri: icon}}
          style={styles.icon}
          resizeMode="contain"
        />
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        style={[styles.input, inputStyle]}
      />
      {buttonIcon && onButtonPress && (
        <TouchableOpacity onPress={onButtonPress} style={styles.button}>
          <Image
            source={buttonIcon}
            style={styles.buttonIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  icon: {
    width: 18,
    height: 18,
    marginRight: 8,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  button: {
    marginLeft: 8,
    padding: 6,
  },
  buttonIcon: {
    width: 18,
    height: 18,
  },
});

export default InputWithButton;
