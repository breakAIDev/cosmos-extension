import { Check } from 'phosphor-react-native';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ViewStyle } from 'react-native';

type Props = {
  icon: string | React.ReactNode;
  label: string;
  isSelected?: boolean;
  isLast?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  style?: ViewStyle;
};

const placeholder = (label: string) =>
  `https://placehold.co/32x32?text=${encodeURIComponent(label)}`;

const FilterItem: React.FC<Props> = ({
  icon,
  label,
  isSelected = false,
  isLast = false,
  onSelect,
  onRemove,
  style,
}) => {
  // For image fallback
  const [imgSrc, setImgSrc] = useState(typeof icon === 'string' ? icon : '');

  return (
    <TouchableOpacity
      style={[
        styles.row,
        !isLast && styles.rowBorder,
        style,
        isSelected && { backgroundColor: '#e6f0fa' },
      ]}
      activeOpacity={0.8}
      onPress={isSelected ? onRemove : onSelect}
    >
      <View style={styles.left}>
        {typeof icon === 'string' ? (
          <Image
            source={{ uri: imgSrc || placeholder(label) }}
            style={styles.icon}
            resizeMode="cover"
            onError={() => setImgSrc(placeholder(label))}
          />
        ) : (
          React.isValidElement(icon) ? (
            icon
          ) : null
        )}
        <Text style={styles.label}>{label}</Text>
      </View>
      {isSelected && (
        <View style={styles.checkCircle}>
          <Check weight="bold" color="#fff" size={14} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  rowBorder: {
    borderBottomColor: '#D1D5DB',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    // gap: 12, // Not yet fully supported
    // Instead:
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#111',
  },
  checkCircle: {
    backgroundColor: '#3664F4',
    borderRadius: 999,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FilterItem;
