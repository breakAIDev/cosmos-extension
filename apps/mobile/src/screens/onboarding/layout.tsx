import React, { PropsWithChildren, ReactNode } from 'react'
import { StyleProp, StyleSheet, ViewProps, ViewStyle } from 'react-native'
import { MotiView } from 'moti'

type ExtensionPageProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  hideRightActions?: boolean;
} & ViewProps;

export const OnboardingLayout = ({ children, style, ...props }: PropsWithChildren<ExtensionPageProps>) => {
  return (
    <MotiView
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </MotiView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden', // matches overflow-x-hidden, overflow-auto
    backgroundColor: '#F1F5F9', // bg-secondary
    marginVertical: 'auto', // my-auto
    marginHorizontal: 'auto', // mx-auto
    borderRadius: 24, // rounded-3xl
    height: '100%',
    width: '100%',
    flexDirection: 'column',
  },
})
