import React, { useState, forwardRef } from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeSlash } from 'phosphor-react-native'; // Use this RN icon library!
import { Input, InputProps } from '.'; // RN version of your Input

export const PasswordInput = forwardRef<any, Omit<InputProps, 'trailingElement'>>(
  (props, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
      <Input
        {...props}
        ref={ref}
        secureTextEntry={!isPasswordVisible}
        trailingElement={
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(v => !v)}
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            {isPasswordVisible ? (
              <Eye size={20} weight="fill" color="#69788A" />
            ) : (
              <EyeSlash size={20} weight="fill" color="#69788A" />
            )}
          </TouchableOpacity>
        }
      />
    );
  }
);

const styles = StyleSheet.create({
  iconButton: {
    padding: 4,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});

PasswordInput.displayName = 'PasswordInput';
