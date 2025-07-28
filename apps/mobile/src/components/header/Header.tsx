import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../text'; // assuming this is a RN-compatible Text wrapper

type Props = {
  heading?: string;
  subtitle?: string;
  SubTitleComponent?: React.FC;
  HeadingComponent?: React.FC;
  headingSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'jumbo';
};

export const Header: React.FC<Props> = ({
  heading,
  subtitle,
  SubTitleComponent,
  HeadingComponent,
  headingSize = 'xxl',
}) => {
  return (
    <View style={styles.container}>
      {HeadingComponent ? (
        <HeadingComponent />
      ) : (
        <Text size={headingSize} style={styles.headingText}>
          {heading}
        </Text>
      )}

      {subtitle ? (
        <Text size="md" color="text-gray-400" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}

      {SubTitleComponent ? <SubTitleComponent /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headingText: {
    fontWeight: '900',
    fontSize: 32, // equivalent to Tailwind's text-4xl
    marginVertical: 12,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    justifyContent: 'center',
    color: '#9ca3af', // Tailwind's text-gray-400
  },
});
