import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Images } from '../../../assets/images';

type CustomCheckboxProps = {
  checked: boolean;
  onClick: () => void;
  isWhite?: boolean;
};

export function CustomCheckbox({ checked, onClick, isWhite }: CustomCheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={styles.wrapper}
      activeOpacity={0.7}
    >
      {checked ? (
        <View style={styles.innerBox}>
          <Image
            source={isWhite ? Images.Misc.FilledRoundedSquareWhite : Images.Misc.FilledRoundedSquareCheckMark}
            style={styles.checkImage}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View
          style={[
            styles.innerBox,
            styles.uncheckedBox,
            { borderColor: isWhite ? '#F3F4F6' : '#059669' }, // white-100 / green-600
          ]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 20,
    height: 20,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerBox: {
    width: 15,
    height: 15,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedBox: {
    borderWidth: 2,
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  checkImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
});
