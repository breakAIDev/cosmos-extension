import React, { ReactNode } from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';

type ResizeProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function Resize({ children, style }: ResizeProps) {
  return <View style={[{ flexDirection: 'row', flexShrink: 1, width: 344 }, style]}>{children}</View>;
}
