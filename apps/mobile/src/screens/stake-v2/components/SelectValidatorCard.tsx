import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Button } from '../../../components/ui/button';
import { PenIcon } from '../../../../assets/icons/pen-icon';

import { useValidatorImage, sliceWord } from '@leapwallet/cosmos-wallet-hooks';
import { Validator } from '@leapwallet/cosmos-wallet-sdk/dist/browser/types/validators';
import { Images } from '../../../../assets/images';
import { GenericDark, GenericLight } from '../../../../assets/images/logos';
import { useTheme } from '@react-navigation/native';
import { Colors } from '../../../theme/colors';

export type SelectValidatorCardProps = {
  selectedValidator?: Validator;
  setShowSelectValidatorSheet: (val: boolean) => void;
  selectDisabled: boolean;
  title: string;
  apr?: number;
  loading?: boolean;
};

export default function SelectValidatorCard({
  selectedValidator,
  setShowSelectValidatorSheet,
  selectDisabled,
  title,
  apr,
  loading,
}: SelectValidatorCardProps) {
  const { data: validatorImage } = useValidatorImage(selectedValidator?.image ? undefined : selectedValidator);
  const imageUrl = selectedValidator?.image || validatorImage || Images.Misc.Validator;
  const theme = useTheme();

  // Adjust width to device if you want, for now fixed max name length
  const moniker =
    selectedValidator
      ? sliceWord(selectedValidator.moniker ?? '', 30, 0)
      : loading
      ? 'Loading...'
      : 'Select Validator';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.row}>
        <View style={styles.leftSection}>
          <Image
            source={{
              uri: selectedValidator ? imageUrl : theme.dark ? GenericDark : GenericLight,
            }}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.infoCol}>
            <Text style={styles.moniker}>{moniker}</Text>
            {apr && !isNaN(+apr) ? (
              <Text style={styles.aprText}>{Number(apr * 100).toFixed(2)}%</Text>
            ) : null}
          </View>
        </View>

        {!selectDisabled && !loading && (
          <Button
            size={'icon'}
            variant={'secondary'}
            style={[styles.iconBtn, {backgroundColor: Colors.secondary300}]}
            onPress={() => setShowSelectValidatorSheet(true)}
          >
            <PenIcon size={24} />
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'column',
    gap: 16,
    marginVertical: 5,
  },
  title: {
    fontWeight: '500',
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6E8EB',
    marginRight: 12,
  },
  infoCol: {
    flexDirection: 'column',
    gap: 2,
  },
  moniker: {
    fontWeight: '700',
    fontSize: 15,
    color: '#111827',
  },
  aprText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  iconBtn: {
    backgroundColor: '#E5E7EB',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});

