import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Clipboard,
} from 'react-native';

// A single word input component
const SeedPhraseWordInput = ({
  wordIndex,
  word,
  handlePaste,
  handleWordChange,
  isError,
  isFocused,
  handleWordFocused,
  handleWordBlur,
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused]);

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
        value={word}
        secureTextEntry={!isFocused && !isError}
        style={styles.wordInput}
        onChangeText={(value) => handleWordChange(wordIndex, value)}
        onFocus={() => handleWordFocused(wordIndex)}
        onBlur={handleWordBlur}
      />
    </TouchableOpacity>
  );
};

export const SeedPhraseInput = ({ onChangeHandler, isError }) => {
  const [focusedWordIndex, setFocusedWordIndex] = useState(-1);
  const [seedPhraseWordCount, setSeedPhraseWordCount] = useState(12);
  const [seedPhraseWords, setSeedPhraseWords] = useState(Array(12).fill(''));

  const handleSeedPhraseWordIndexChange = (count) => {
    setSeedPhraseWordCount(count);
    const newWords = Array(count).fill('');
    setSeedPhraseWords(newWords);
    onChangeHandler('');
  };

  const handlePaste = (wordIndex, clipboardText) => {
    const words = clipboardText.trim().split(' ').filter(Boolean);

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

  const handleWordChange = (wordIndex, value) => {
    const updated = [...seedPhraseWords];
    updated[wordIndex - 1] = value;
    setSeedPhraseWords(updated);
    onChangeHandler(updated.join(' '));
  };

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
            handleWordFocused={setFocusedWordIndex}
            handleWordBlur={() => setFocusedWordIndex(-1)}
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
