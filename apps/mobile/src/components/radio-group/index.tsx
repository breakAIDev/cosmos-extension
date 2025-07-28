import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

type OptionType = {
  title: string;
  subTitle?: string;
  value: string;
};

type RadioGroupProps = {
  options: OptionType[];
  selectedOption: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
  themeColor?: string;
};

const RadioGroup: React.FC<RadioGroupProps> = ({ options, selectedOption, onChange, style, themeColor = '#2563eb' }) => {
  return (
    <View style={[styles.container, style]}>
      {options.map((option, index) => {
        const isSelected = selectedOption === option.value;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.8}
            style={[
              styles.item,
              !isLast && styles.itemBorder,
              option.subTitle ? styles.itemWithSubtitle : styles.itemWithoutSubtitle,
            ]}
          >
            <View style={[styles.radioOuter, { borderColor: isSelected ? themeColor : '#d1d5db' }]}>
              <View
                style={[
                  styles.radioInner,
                  {
                    backgroundColor: isSelected ? themeColor : '#d1d5db',
                    opacity: isSelected ? 1 : 0,
                  },
                ]}
              />
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{option.title}</Text>
              {option.subTitle && <Text style={styles.subTitle}>{option.subTitle}</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  itemWithSubtitle: {
    paddingVertical: 8,
  },
  itemWithoutSubtitle: {
    paddingVertical: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textContainer: {
    marginLeft: 12,
    flexShrink: 1,
  },
  title: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  subTitle: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default RadioGroup;
