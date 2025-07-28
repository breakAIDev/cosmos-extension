import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

type RangeInputProps = {
  initialValue: number;
  onChangeHandler: (value: number) => void;
  activeColor?: string;
  min?: number;
  max?: number;
  step?: number;
};

const RangeInput: React.FC<RangeInputProps> = ({
  initialValue,
  onChangeHandler,
  activeColor = '#FF958C',
  min = 1,
  max = 5,
  step = 1,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (val: number) => {
    setValue(val);
    onChangeHandler(val);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{`${value}%`}</Text>
      <Slider
        value={value}
        onValueChange={handleChange}
        minimumValue={min}
        maximumValue={max}
        step={step}
        minimumTrackTintColor={activeColor}
        maximumTrackTintColor="#D6D6D6"
        thumbTintColor={activeColor}
        style={styles.slider}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  label: {
    marginBottom: 12,
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#000',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  slider: {
    width: '90%',
    height: 40,
  },
});

export default RangeInput;
