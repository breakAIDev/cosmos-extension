import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
import { sliceWord } from '@leapwallet/cosmos-wallet-hooks';
import { Images } from '../../../../assets/images';

type ValidatorCardProps = {
  onPress?: () => void;
  imgSrc?: string;
  moniker: string;
  titleAmount: string;
  subAmount: string;
  jailed?: boolean;
  disabled?: boolean;
  subText?: string;
};

export const ValidatorCardView = React.memo(
  ({
    onPress,
    imgSrc,
    moniker,
    titleAmount,
    subAmount,
    jailed,
    disabled,
    subText,
  }: ValidatorCardProps) => {
    // Responsive name slice logic (adjust as needed)
    const screenWidth = Dimensions.get('window').width;
    const sidePanel = false; // Provide your logic here if needed
    const nameMaxLen = sidePanel
      ? 5 + Math.floor(((Math.min(screenWidth, 400) - 320) / 81) * 7)
      : 10;

    // Image fallback (basic RN logic)
    const [imgError, setImgError] = React.useState(false);
    const finalImgSrc = !imgError && imgSrc ? { uri: imgSrc } : {uri: Images.Misc.Validator};

    return (
      <TouchableOpacity
        disabled={disabled || !onPress}
        onPress={onPress}
        activeOpacity={disabled ? 1 : 0.8}
        style={[
          styles.card,
          disabled && styles.cardDisabled,
        ]}
      >
        <Image
          source={finalImgSrc}
          style={styles.avatar}
          width={36}
          height={36}
          onError={() => setImgError(true)}
        />

        <View style={styles.rowBetween}>
          <View style={styles.infoColumn}>
            <Text
              style={styles.monikerText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {sliceWord(moniker, nameMaxLen, 3)}
            </Text>

            {subText ? (
              <Text style={styles.subText}>{subText}</Text>
            ) : jailed ? (
              <Text style={styles.jailedText}>Jailed</Text>
            ) : null}
          </View>

          <View style={styles.amountColumn}>
            <Text style={styles.titleAmount}>{titleAmount}</Text>
            <Text style={styles.subAmount}>{subAmount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

ValidatorCardView.displayName = 'ValidatorCardView';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f5f8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 10,
  },
  cardDisabled: {
    opacity: 0.5,
    backgroundColor: '#f4f5f8',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 16,
    backgroundColor: '#e5e5e5',
  },
  rowBetween: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 1,
    flexShrink: 1,
    minWidth: 80,
    maxWidth: 160,
  },
  monikerText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    flexShrink: 1,
    marginBottom: 1,
  },
  subText: {
    fontWeight: '500',
    fontSize: 12,
    color: '#999',
    marginTop: 1,
    textAlign: 'right',
  },
  jailedText: {
    fontWeight: '500',
    fontSize: 12,
    color: '#d12a40',
    marginTop: 2,
    textAlign: 'right',
  },
  amountColumn: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 1,
    minWidth: 80,
  },
  titleAmount: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#222',
    textAlign: 'right',
  },
  subAmount: {
    fontWeight: '500',
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    marginTop: 1,
  },
});
