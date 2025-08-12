import React, { Fragment, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Info } from 'phosphor-react-native';
import BottomModal from '../../../components/new-bottom-modal';
import Text from '../../../components/text';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { CardDivider } from '@leapwallet/leap-ui'; // If you have a native version

type ITally = {
  label: string;
  value: number;
};

export function Turnout({ tallying }: { tallying: ITally[] }) {
  const [detail, showDetail] = useState('');

  return (
    <>
      <View style={styles.card}>
        {tallying.map((tally, index) => (
          <Fragment key={tally.label}>
            <View style={styles.row}>
              <View style={styles.leftRow}>
                <Text style={styles.labelText}>{tally.label}</Text>
                <TouchableOpacity onPress={() => showDetail(tally.label)} style={styles.infoBtn}>
                  <Info size={16} color="#8e99af" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
              {tally.value ? (
                <Text style={styles.valueText}>{`${Number(tally.value).toFixed(2)}%`}</Text>
              ) : (
                <SkeletonPlaceholder>
                  <SkeletonPlaceholder.Item width={50} height={18} borderRadius={5} />
                </SkeletonPlaceholder>
              )}
            </View>
            {index === 0 ? (
              <CardDivider />
            ) : null}
          </Fragment>
        ))}
      </View>

      <BottomModal isOpen={!!detail} onClose={() => showDetail('')} title={detail}>
        <Text style={styles.modalText}>
          {detail === 'Turnout'
            ? 'Defined as the percentage of voting power already casted on a proposal as a percentage of total staked tokens.'
            : 'Defined as the minimum percentage of voting power that needs to be cast on a proposal for the result to be valid.'}
        </Text>
      </BottomModal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#f2f4fa', // secondary-100
    marginTop: 28,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelText: {
    color: '#22272e', // secondary-800
    fontSize: 14,
  },
  infoBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  valueText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#22272e',
  },
  modalText: {
    fontSize: 14,
    color: '#22272e',
    marginTop: 8,
  },
});
