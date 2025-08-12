import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAirdropsEligibilityData } from '@leapwallet/cosmos-wallet-hooks';
import { CaretRight } from 'phosphor-react-native';
import Text from '../../../components/text';
import { Images } from '../../../../assets/images';
import { trim } from '../../../utils/strings';

export default function FailedAirdrops() {
  const navigation = useNavigation();
  const airdropsEligibilityData = useAirdropsEligibilityData() || {};
  const failedAirdrops = Object.values(airdropsEligibilityData).filter(
    (d) => d?.status === 'failed' && !d?.isHidden
  );

  if (failedAirdrops.length < 1) {
    return null;
  }

  return (
    <View>
      <Text size="sm" style={styles.title}>
        Status unavailable
      </Text>
      <View>
        {failedAirdrops.map((d, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.airdropContainer,
              index !== failedAirdrops.length - 1 && styles.marginBottom,
            ]}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('AirdropsDetails', { airdropId: d.id })
            }
          >
            <Image
              source={typeof d.airdropIcon === 'string' ? { uri: d.airdropIcon } : d.airdropIcon}
              style={styles.airdropIcon}
            />
            <View style={styles.nameRow}>
              <Text size="sm" style={styles.airdropName}>
                {trim(d.name, 30)}
              </Text>
              <Image
                source={{uri: Images.Misc.InfoFilledExclamationRedMark}}
                style={styles.infoIcon}
                resizeMode="contain"
              />
            </View>
            <CaretRight size={16} color="#6B7280" style={styles.caret} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 14,
  },
  airdropContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6', // secondary-100
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  marginBottom: {
    marginBottom: 16,
  },
  airdropIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  airdropName: {
    fontWeight: '500',
    fontSize: 14,
    flexShrink: 1,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
    transform: [{ rotate: '180deg' }],
  },
  caret: {
    marginLeft: 8,
    alignSelf: 'center',
  },
});
