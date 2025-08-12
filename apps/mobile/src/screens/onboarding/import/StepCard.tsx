import React, { useEffect, useRef, useState } from 'react';
import { View, Text as RNText, Image, StyleSheet, Animated, Easing } from 'react-native';
import { CheckCircle } from 'phosphor-react-native';
import Text from '../../../components/text';
import { Images } from '../../../../assets/images';

export interface StepCardProps {
  stepNo: number;
  description: string;
  suggestion?: string;
  status: 'pending' | 'processing' | 'done';
}

export default function StepCard({ stepNo, description, suggestion, status }: StepCardProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Animation refs for suggestion box
  const opacity = useRef(new Animated.Value(0)).current;
  const height = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'pending') {
      let timer = 0;
      const timerId = setInterval(() => {
        if (timer >= 4) {
          clearInterval(timerId);
          setShowSuggestions(true);
        }
        timer = timer + 1;
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [status]);

  useEffect(() => {
    if (showSuggestions && status === 'done') {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
      Animated.timing(height, {
        toValue: 54,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
      Animated.timing(height, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.linear,
      }).start();
    }
  }, [height, opacity, showSuggestions, status]);

  // Card opacity
  const cardOpacity = status === 'pending' ? 0.4 : 1;

  return (
    <View style={[styles.card, { opacity: cardOpacity }]}>
      <View style={styles.row}>
        {/* Step image or icon */}
        {status === 'pending' ? (
          <Image
            source={{uri: Images.Misc.ConnectLedgerSteps}}
            style={styles.ledgerImage}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[
              styles.iconCircle,
              status === 'processing' && styles.processingBorder,
            ]}
          >
            <View style={styles.innerCircle}>
              {status === 'done' && (
                <CheckCircle weight="fill" size={32} color="#22c55e" />
              )}
            </View>
          </View>
        )}

        {/* Vertical Divider */}
        <View style={styles.verticalDivider} />

        {/* Step Content */}
        <View style={styles.flex1}>
          <Text size="lg" style={styles.bold}>
            Step {stepNo}
          </Text>
          <Text size="md" style={styles.desc}>
            {description}
          </Text>
        </View>
      </View>

      {/* Suggestion */}
      {suggestion && (
        <Animated.View
          style={[
            styles.suggestion,
            {
              opacity: opacity,
              height: height,
              paddingVertical: showSuggestions && status === 'done' ? 16 : 0,
            },
          ]}
        >
          <RNText style={styles.suggestionText}>{suggestion}</RNText>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 32,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    padding: 24,
    gap: 24,
    borderRadius: 16,
    backgroundColor: '#E5E7EB', // bg-gray-200
    alignItems: 'center',
  },
  ledgerImage: {
    width: 56,
    height: 56,
  },
  iconCircle: {
    width: 72,
    height: 72,
    backgroundColor: '#F3F4F6', // bg-gray-300
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB', // gray border
  },
  processingBorder: {
    borderColor: '#22c55e', // border-green-600
    // Optionally add a ripple loader here if needed
  },
  innerCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  verticalDivider: {
    backgroundColor: '#9CA3AF', // bg-gray-400
    height: 32,
    width: 2,
    borderRadius: 4,
  },
  flex1: {
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  desc: {
    color: '#1f2937', // text-gray-800
    fontWeight: '500',
  },
  suggestion: {
    paddingHorizontal: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  suggestionText: {
    color: '#fff', // text-white-100
    fontWeight: '500',
  },
});
