import React from 'react';
import { Switch } from 'react-native';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export const CustomSwitch: React.FC<Props> = ({ value, onValueChange, disabled }) => (
  <Switch value={value} onValueChange={onValueChange} disabled={disabled} />
);
