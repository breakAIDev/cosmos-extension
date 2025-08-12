import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks';
import { CaretDown, CaretUp } from 'phosphor-react-native';
import Text from '../../../components/text';
import { trim } from '../../../utils/strings';

export default function InEligibleAirdrops() {
  const [showMore, setShowMore] = useState(false);
  const airdropsEligibilityData = useAirdropsEligibilityData() || {};
  const inEligibleAirdrops = Object.values(airdropsEligibilityData).filter(
    (d) => !d?.isEligible && d?.status !== 'failed' && !d?.isHidden,
  );

  return (
    <View>
      <View style={styles.headerRow}>
        <Text size="sm" style={styles.headerText}>
          Ineligible Airdrops
        </Text>
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setShowMore((prev) => !prev)}
          activeOpacity={0.7}
        >
          <Text size="sm" style={styles.toggleText}>
            Show {showMore ? 'less' : 'more'}
          </Text>
          {showMore ? (
            <CaretUp size={16} color="#6B7280" style={styles.icon} />
          ) : (
            <CaretDown size={16} color="#6B7280" style={styles.icon} />
          )}
        </TouchableOpacity>
      </View>
      {showMore && (
        <View style={{ marginTop: 12 }}>
          {inEligibleAirdrops.map((d, index) => (
            <View
              key={index}
              style={[
                styles.airdropContainer,
                index !== inEligibleAirdrops.length - 1 && styles.mb4,
              ]}
            >
              <Image
                source={typeof d.airdropIcon === 'string' ? { uri: d.airdropIcon } : d.airdropIcon}
                style={styles.airdropIcon}
                resizeMode="cover"
              />
              <Text size="sm" style={styles.airdropName}>
                {trim(d.name, 34)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toggleText: {
    color: '#6B7280',
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 2,
  },
  icon: {
    alignSelf: 'center',
  },
  airdropContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6', // secondary-100
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  mb4: {
    marginBottom: 16,
  },
  airdropIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  airdropName: {
    fontWeight: '500',
    fontSize: 14,
    flexShrink: 1,
  },
});
