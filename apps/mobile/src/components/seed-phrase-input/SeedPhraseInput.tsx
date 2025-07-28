import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  Clipboard,
  Platform,
} from 'react-native';

type SeedPhraseWordInputProps = {
  wordIndex: number;
  word: string;
  handlePaste: (wordIndex: number, value: string) => void;
  handleWordChange: (wordIndex: number, value: string) => void;
  isError: boolean;
  isFocused: boolean;
  handleWordFocused: (wordIndex: number) => void;
  handleWordBlur: () => void;
};

const SeedPhraseWordInput = ({
  wordIndex,
  word,
  handlePaste,
  handleWordChange,
  isError,
  isFocused,
  handleWordFocused,
  handleWordBlur,
}: SeedPhraseWordInputProps) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

  const handleInputFocus = () => handleWordFocused(wordIndex);
  const handleInputBlur = () => handleWordBlur();

  const handleInputPaste = async () => {
    const text = await Clipboard.getString();
    handlePaste(wordIndex, text);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={[styles.wordInputContainer, isError && styles.errorBorder]}
      onPress={handleInputPaste}
    >
      <Text style={styles.wordIndex}>{wordIndex}</Text>
      <TextInput
        ref={inputRef}
        style={styles.wordInput}
        value={word}
        secureTextEntry={!isFocused && !isError}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onChangeText={(value) => handleWordChange(wordIndex, value)}
        placeholder=""
      />
    </TouchableOpacity>
  );
};

type SeedPhraseInputProps = {
  onChangeHandler: (value: string) => void;
  isError: boolean;
};

export const SeedPhraseInput = ({ onChangeHandler, isError }: SeedPhraseInputProps) => {
  const [focusedWordIndex, setFocusedWordIndex] = useState<number>(-1);
  const [seedPhraseWordCount, setSeedPhraseWordCount] = useState<number>(12);
  const [seedPhraseWords, setSeedPhraseWords] = useState<string[]>(Array(12).fill(''));

  const handleSeedPhraseWordIndexChange = (count: number) => {
    setSeedPhraseWordCount(count);
    const newWords = new Array(count).fill('');
    setSeedPhraseWords(newWords);
    onChangeHandler('');
  };

  const handlePaste = (wordIndex: number, clipboardText: string) => {
    const words = clipboardText
      .trim()
      .split(' ')
      .map((word) => word.trim())
      .filter(Boolean);

    if (words.length === 12 || words.length === 24) {
      handleSeedPhraseWordIndexChange(words.length);
      setSeedPhraseWords(words);
      onChangeHandler(words.join(' '));
      return;
    }

    const updated = [...seedPhraseWords];
    for (let i = wordIndex; i < Math.min(seedPhraseWordCount, words.length + wordIndex); i++) {
      updated[i - 1] = words[i - wordIndex];
    }
    setSeedPhraseWords(updated);
    onChangeHandler(updated.join(' '));
  };

  const handleWordChange = (wordIndex: number, value: string) => {
    const updated = [...seedPhraseWords];
    updated[wordIndex - 1] = value;
    setSeedPhraseWords(updated);
    onChangeHandler(updated.join(' '));
  };

  const handleWordFocused = (index: number) => setFocusedWordIndex(index);
  const handleWordBlur = () => setFocusedWordIndex(-1);

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, seedPhraseWordCount === 12 && styles.activeTab]}
          onPress={() => handleSeedPhraseWordIndexChange(12)}
        >
          <Text style={styles.tabText}>12 words</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, seedPhraseWordCount === 24 && styles.activeTab]}
          onPress={() => handleSeedPhraseWordIndexChange(24)}
        >
          <Text style={styles.tabText}>24 words</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.wordsGrid}>
        {seedPhraseWords.map((value, index) => (
          <SeedPhraseWordInput
            key={`${value}-${index}`}
            wordIndex={index + 1}
            word={value}
            handlePaste={handlePaste}
            handleWordChange={handleWordChange}
            isError={isError}
            isFocused={focusedWordIndex === index + 1}
            handleWordFocused={handleWordFocused}
            handleWordBlur={handleWordBlur}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    width: '100%',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  activeTab: {
    backgroundColor: '#4f46e5',
  },
  tabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  wordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    width: '30%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  errorBorder: {
    borderColor: 'red',
  },
  wordIndex: {
    marginRight: 6,
    color: '#6b7280',
    fontSize: 12,
  },
  wordInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
});
