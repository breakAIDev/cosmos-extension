import React from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard'; // yarn add @react-native-clipboard/clipboard

type TextareaWithPasteProps = {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoFocus?: boolean;
  style?: any;
};

export const TextareaWithPaste = ({
  error,
  value,
  onChangeText,
  placeholder,
  autoFocus,
  style,
}: TextareaWithPasteProps) => {
  const handlePaste = async () => {
    const text = await Clipboard.getString();
    if (text) onChangeText(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.textarea,
          error && styles.errorBorder,
          style,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoFocus={autoFocus}
        multiline
        textAlignVertical="top"
        placeholderTextColor="#97A3B9"
      />

      {value.length === 0 && (
        <TouchableOpacity
          style={styles.pasteButton}
          onPress={handlePaste}
          activeOpacity={0.8}
        >
          <Text style={styles.pasteText}>Paste</Text>
        </TouchableOpacity>
      )}

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    marginBottom: 6,
  },
  textarea: {
    width: '100%',
    minHeight: 150,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#F3F7F6',
    borderWidth: 1,
    borderColor: '#E3F9EC',
  },
  errorBorder: {
    borderColor: '#E2655A',
  },
  pasteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#F7F9FA',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 1,
  },
  pasteText: {
    color: '#97A3B9',
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    color: '#E2655A',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});
