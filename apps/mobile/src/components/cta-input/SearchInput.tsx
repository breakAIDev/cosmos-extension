import { MagnifyingGlass } from '@phosphor-icons/react';
import classNames from 'classnames';
import Text from '../text';
import React, { useEffect, useRef } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Keyboard, Platform } from 'react-native';

type SearchInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  action?: string;
  actionHandler?: () => void;
  onClear: () => void;
  autoFocus?: boolean;
  placeholder?: string;
  inputDisabled?: boolean;
  type?: 'text' | 'number';
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export function CtaInput({
  value,
  onChange,
  onClear,
  autoFocus = false,
  placeholder,
  inputDisabled,
  action,
  actionHandler,
  type = 'text',
  rest
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current && autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [autoFocus]);

  return (
    <View
      style={[styles.container, rest]}
    >
      <TextInput
        ref={inputRef}
        placeholder={placeholder || 'Search...'}
        style={styles.input}
        value={value}
        editable={!inputDisabled}
        onChangeText={onChange}
        keyboardType={type === 'number' ? 'numeric' : 'default'}
        autoFocus={autoFocus}
        selectionColor="#4F8EF7"
        returnKeyType="search"
      />

      {value.length === 0 ? (
        action ? (
          <TouchableOpacity style={styles.actionButton} onPress={actionHandler}>
            <Text style={styles.actionText}>{action}</Text>
          </TouchableOpacity>
        ) : (
          <MagnifyingGlass size={18} className='text-muted-foreground' />
        )
      ) : action ? (
        <TouchableOpacity style={styles.actionButton} onPress={onClear}>
          <Text style={styles.actionText}>Clear</Text>
        </TouchableOpacity>
      ) : (
         <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 344,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 1,
    elevation: 1,
    alignSelf: 'center',
  },
  input: {
    flex: 1,
    color: '#7B849B',
    fontSize: 16,
    backgroundColor: 'transparent',
    paddingVertical: 0,
  },
  iconWrapper: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#F0F4FA',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 8,
  },
  actionText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 13,
    textTransform: 'capitalize',
  },
  clearButton: {
    marginLeft: 8,
  },
  clearText: {
    color: '#7B849B',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
