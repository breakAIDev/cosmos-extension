import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

type SeparatorProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
  style?: any;
};

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  color = '#E6EAEF',        // bg-secondary-200
  thickness,
  style,
  ...props
}) => {
  return (
    <View
      style={[
        orientation === 'horizontal'
          ? {
              height: thickness || StyleSheet.hairlineWidth,
              width: '100%',
            }
          : {
              width: thickness || StyleSheet.hairlineWidth,
              height: '100%',
            },
        { backgroundColor: color, alignSelf: 'stretch' },
        style,
      ]}
      {...props}
    />
  );
};
