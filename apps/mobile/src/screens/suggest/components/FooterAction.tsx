import React, { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Buttons } from '@leapwallet/leap-ui'; // kept as-is (shimmed below)
import { Colors } from '../../../theme/colors';

type FooterActionProps = {
  error?: string;
  rejectBtnText: ReactNode;
  rejectBtnClick: () => void;
  confirmBtnText: ReactNode;
  confirmBtnClick?: () => void;
  isConfirmBtnDisabled?: boolean;
};

export function FooterAction({
  error,
  rejectBtnClick,
  rejectBtnText,
  confirmBtnClick,
  confirmBtnText,
  isConfirmBtnDisabled,
}: FooterActionProps) {
  return (
    <View style={[styles.row, !!error && styles.mb6]}>
      <Buttons.Generic
        style={[styles.btn, { backgroundColor: Colors.gray900 }]}
        textStyle={{ color: Colors.white100 }}
        onClick={rejectBtnClick}
      >
        {rejectBtnText}
      </Buttons.Generic>

      <Buttons.Generic
        style={[styles.btn, styles.ml3, { backgroundColor: Colors.cosmosPrimary }]}
        textStyle={{ color: Colors.white100 }}
        onClick={confirmBtnClick}
        disabled={isConfirmBtnDisabled}
      >
        {confirmBtnText}
      </Buttons.Generic>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  mb6: { marginBottom: 24 }, // matches tailwind mb-6
  ml3: { marginLeft: 12 },   // tailwind ml-3
  btn: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
