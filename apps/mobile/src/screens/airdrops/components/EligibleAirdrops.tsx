import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { CaretRight } from 'phosphor-react-native'; // Replace with RN icon if needed
import { formatTokenAmount, useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks';
import { trim } from '../../../utils/strings';
import EmptyAirdrops from './EmptyAirdrops';
import { useNavigation } from '@react-navigation/native';

export default function EligibleAirdrops() {
  const airdropsEligibilityData = useAirdropsEligibilityData() || {};
  const eligibleAirdrops = Object.values(airdropsEligibilityData).filter((d) => d?.isEligible && !d?.isHidden);
  const navigation = useNavigation();

  // For trimming name: use device width to decide max length
  const windowWidth = Dimensions.get('window').width;
  const nameTrimLength = windowWidth > 400
    ? 17 + Math.floor(((Math.min(windowWidth, 400) - 320) / 81) * 7)
    : 17;

  if (eligibleAirdrops.length < 1) {
    return (
      <EmptyAirdrops
        title="No eligible Airdrops"
        subTitle={
          <>
            You can change your wallet or{'\n'}check all airdrops on Leapboard.
          </>
        }
        showLeapBoardButton={true}
      />
    );
  }

  return (
    <View>
      <Text style={styles.header}>Eligible Airdrops</Text>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {eligibleAirdrops.map((d, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.row,
              index !== eligibleAirdrops.length - 1 && styles.rowMargin,
            ]}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('AirdropsDetails', { airdropId: d.id })
            }
          >
            <Image source={{ uri: d.airdropIcon }} style={styles.icon} />
            <Text style={styles.name}>
              {trim(d.name, nameTrimLength)}
            </Text>
            <Text style={styles.amount}>
              {d.totalAmount
                ? formatTokenAmount(String(d.totalAmount), d.tokenInfo[0]?.denom, 2)
                : d.tokenInfo[0]?.denom}
            </Text>
            <CaretRight size={16} color="#64748b" /* gray-600 */ style={styles.caretIcon} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111', // or use your theme color
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA', // secondary-100
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 0,
    gap: 8,
  },
  rowMargin: {
    marginBottom: 16,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
  },
  amount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111',
    minWidth: 80,
    textAlign: 'right',
  },
  caretIcon: {
    marginLeft: 8,
  },
});
