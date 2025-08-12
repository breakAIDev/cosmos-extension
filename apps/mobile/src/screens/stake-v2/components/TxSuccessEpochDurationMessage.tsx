import { STAKE_MODE } from '@leapwallet/cosmos-wallet-hooks';
import { Info } from 'phosphor-react-native';
import Text from '../../../components/text';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { epochIntervalStore } from '../../../context/epoch-interval-store';

const epochMessageMap: Record<Partial<STAKE_MODE>, string | null> = {
  DELEGATE: 'staking',
  UNDELEGATE: 'unstaking',
  CANCEL_UNDELEGATION: 'cancel unstaking',
  REDELEGATE: 'restaking',
  CLAIM_REWARDS: null,
};

export const TxSuccessEpochDurationMessage = observer((props: { mode: STAKE_MODE }) => {
  const message = epochMessageMap[props.mode];
  if (!message) {
    return null;
  }

  const fullMessage = `Amount is queued for ${message} in next epoch (${epochIntervalStore.timeLeft}).`;

  return (
    <View style={styles.container}>
      <Info size={20} color="#f59e42" style={styles.icon} weight="regular" />
      <Text style={styles.message}>{fullMessage}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#fff7eb',
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  icon: {
    marginRight: 6,
  },
  message: {
    fontSize: 13,
    color: '#865013',
    flexShrink: 1,
  },
});
