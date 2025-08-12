import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';

type OnboardingWrapperProps = {
  children: ReactNode;
  heading: string;
  subHeading?: string | React.ReactNode;
  entry?: 'left' | 'right';
  style?: any;
  headerIcon?: ReactNode;
};

const transition = { type: 'timing', duration: 350 };

export const OnboardingWrapper = ({
  children,
  heading,
  subHeading,
  style,
  entry = 'right',
  headerIcon,
}: OnboardingWrapperProps) => {
  return (
    <MotiView
      style={[styles.container, style]}
      from={{
        opacity: 0,
        translateX: entry === 'left' ? -25 : 25,
      }}
      animate={{
        opacity: 1,
        translateX: 0,
      }}
      exit={{
        opacity: 0,
        translateX: 0,
      }}
      transition={transition}
    >
      <View style={styles.header}>
        {headerIcon ? (
          <View style={styles.headerIconWrapper}>
            {React.isValidElement(headerIcon) ? headerIcon : <View/>}
          </View>
        ) : null}
        <Text style={styles.heading}>{heading}</Text>
        {React.isValidElement(subHeading) ? subHeading :
        (typeof subHeading === 'string' ?
          <Text style={styles.subHeading}>{subHeading}</Text> : null
        ) }
      </View>

      <View style={styles.childrenWrapper}>
        {React.isValidElement(children) ? children : <View/>}
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'stretch',
    // Don't use 'gap' in RN <0.71, use margin instead
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 28, // gap between header and children
  },
  headerIconWrapper: {
    width: 64,
    height: 64,
    backgroundColor: '#E5E7EB', // secondary-200, change as needed
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 24, // 1.5rem
    textAlign: 'center',
    color: '#111', // or your theme color
    marginTop: 4,
  },
  subHeading: {
    fontSize: 14, // 0.875rem
    fontWeight: '500',
    color: '#97A3B9', // muted-foreground
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 4,
  },
  childrenWrapper: {
    flex: 1,
    // you can add padding or margin here if needed
  },
});
