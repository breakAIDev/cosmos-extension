import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, useColorScheme, ScrollView } from 'react-native';
import { Info } from 'phosphor-react-native';
import { useCaptureUIException } from '../../hooks/perf-monitoring/useCaptureUIException';

type ErrorCardProps = {
  text?: string;
  style?: object;
  testID?: string;
};

export function ErrorCard({ text, style, testID }: ErrorCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scrollRef = useRef(null);

  // Optionally scroll to this component on mount (rarely needed on mobile)
  useEffect(() => {
    if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  }, []);

  useCaptureUIException(text);

  return (
    <View
      style={[
        styles.card,
        isDark ? styles.cardDark : styles.cardLight,
        style,
      ]}
      ref={scrollRef}
      testID={testID}
    >
      <Info
        size={24}
        color={isDark ? '#FCA5A5' : '#F87171'}
        weight="regular"
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          { color: isDark ? '#FECACA' : '#F87171' }, // text-red-100 (dark), text-red-300 (light)
        ]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    width: 344,
    borderWidth: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardLight: {
    borderColor: '#FECACA', // border-red-200
    backgroundColor: '#FEE2E2', // bg-red-100
  },
  cardDark: {
    borderColor: '#991B1B', // border-red-800
    backgroundColor: '#7F1D1D', // bg-red-900
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '500',
    fontSize: 14,
    flex: 1,
  },
});
