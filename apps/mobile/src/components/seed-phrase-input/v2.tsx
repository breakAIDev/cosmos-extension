import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { AnimatePresence, MotiView } from 'moti'; // using 'moti' for motion.div
import { TabSelectors } from '../../components/ui/tab-list-selectors'; // Path as appropriate

type SeedPhraseWordInputProps = {
  handlePaste: (wordIndex: number, value: string) => void;
  wordIndex: number;
  word: string;
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
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <View
      style={[
        styles.wordInputContainer,
        isError ? styles.wordInputError : styles.wordInputDefault,
      ]}
    >
      <Text style={styles.wordIndex}>{wordIndex}</Text>
      <TextInput
        ref={inputRef}
        style={styles.wordInput}
        secureTextEntry={!isFocused && !isError}
        value={word}
        onChangeText={(text) => handleWordChange(wordIndex, text)}
        onFocus={() => handleWordFocused(wordIndex)}
        onBlur={handleWordBlur}
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

type SeedPhraseInputProps = {
  onChangeHandler: (value: string) => void;
  isError: boolean;
  onPage?: string;
  className?: string; // unused in RN
};

const transition = { type: 'timing', duration: 200, easing: 'ease-in-out' };

export const SeedPhraseInput = ({ onChangeHandler, isError }: SeedPhraseInputProps) => {
  const [focusedWordIndex, setFocusedWordIndex] = useState(1);
  const [seedPhraseWordCount, setSeedPhraseWordCount] = useState(12);
  const [seedPhraseWords, setSeedPhraseWords] = useState<string[]>(Array(12).fill(''));

  const handleSeedPhraseWordIndexChange = (newCount: number) => {
    setSeedPhraseWordCount(newCount);
    setSeedPhraseWords(Array(newCount).fill(''));
    setFocusedWordIndex(1);
  };

  // In React Native, user pastes whole seed by long-press context menu. If you want a dedicated Paste button, see comment in SeedPhraseWordInput.
  const handlePaste = (wordIndex: number, clipboardText: string) => {
    const words = clipboardText
      .trim()
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length);

    if (words.length) {
      if (words.length === 12 || words.length === 24) {
        handleSeedPhraseWordIndexChange(words.length);
        setSeedPhraseWords(words);
        onChangeHandler(words.join(' ').trim());
        return;
      }

      const newWords = [...seedPhraseWords];
      for (let index = wordIndex - 1; index < Math.min(seedPhraseWordCount, words.length + wordIndex - 1); index++) {
        newWords[index] = words[index - (wordIndex - 1)];
      }
      setSeedPhraseWords(newWords);
      onChangeHandler(newWords.join(' ').trim());
    }
  };

  const handleWordChange = (wordIndex: number, value: string) => {
    const newWords = [...seedPhraseWords];
    newWords[wordIndex - 1] = value;
    setSeedPhraseWords(newWords);
    onChangeHandler(newWords.join(' ').trim());
  };

  const handleWordFocused = (wordIndex: number) => setFocusedWordIndex(wordIndex);
  const handleWordBlur = () => setFocusedWordIndex(-1);

  return (
    <View style={[styles.container, isError ? styles.errorHeight : styles.defaultHeight]}>
      <TabSelectors
        selectedIndex={seedPhraseWordCount === 12 ? 0 : 1}
        buttons={[
          { label: '12 words', onClick: () => handleSeedPhraseWordIndexChange(12) },
          { label: '24 words', onClick: () => handleSeedPhraseWordIndexChange(24) },
        ]}
      />

      <AnimatePresence>
        <MotiView
          key={seedPhraseWordCount}
          from={{ opacity: 0, translateX: seedPhraseWords.length === 12 ? 12 : -12 }}
          animate={{ opacity: 1, translateX: 0 }}
          exit={{ opacity: 0, translateX: seedPhraseWords.length === 12 ? -12 : 12 }}
          transition={transition}
          style={styles.gridWrapper}
        >
          <ScrollView
            contentContainerStyle={[
              styles.grid,
              { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
            ]}
            keyboardShouldPersistTaps="handled"
            horizontal={false}
          >
            {seedPhraseWords.map((value, index) => (
              <SeedPhraseWordInput
                wordIndex={index + 1}
                key={`${value}-${index}`}
                word={value}
                handlePaste={handlePaste}
                handleWordChange={handleWordChange}
                isError={isError}
                isFocused={index + 1 === focusedWordIndex}
                handleWordFocused={handleWordFocused}
                handleWordBlur={handleWordBlur}
              />
            ))}
          </ScrollView>
        </MotiView>
      </AnimatePresence>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    gap: 24,
  },
  errorHeight: {
    minHeight: 320,
  },
  defaultHeight: {
    minHeight: 380,
  },
  gridWrapper: {
    width: '100%',
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  wordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F7F6', // bg-secondary-200
    height: 36,
    width: 112,
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 6,
    overflow: 'hidden',
    marginVertical: 4,
  },
  wordInputError: {
    borderColor: '#E2655A', // error color
    borderWidth: 1,
  },
  wordInputDefault: {
    borderColor: '#E3F9EC', // default
    borderWidth: 1,
  },
  wordIndex: {
    color: '#8A98A9', // muted-foreground
    marginRight: 4,
    fontWeight: 'bold',
    fontSize: 12,
  },
  wordInput: {
    flex: 1,
    fontWeight: 'bold',
    backgroundColor: 'transparent',
    color: '#222', // foreground
    fontSize: 14,
    padding: 0,
  },
});
