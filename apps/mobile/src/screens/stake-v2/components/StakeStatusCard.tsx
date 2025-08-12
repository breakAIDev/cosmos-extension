import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { Info } from 'phosphor-react-native';
import Text from '../../../components/text';
import { Button } from '../../../components/ui/button';
import { Images } from '../../../../assets/images';
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

type StakeStatusCardProps = {
  title: string;
  message: string;
  backgroundColor: string;      // e.g. '#fff7eb' or use colors from theme/colors file
  backgroundColorDark: string;  // e.g. '#f5d5b5'
  color: string;                // icon/text color, e.g. '#f59e42'
  onAction: () => void;
};

export default function StakeStatusCard({
  title,
  message,
  backgroundColor,
  backgroundColorDark,
  color,
  onAction,
}: StakeStatusCardProps) {
  const { theme } = useTheme();

  return (
    <>
      <View style={[
        styles.card,
        { backgroundColor: backgroundColor }
      ]}>
        <View style={styles.row}>
          <Info size={16} color={color} style={styles.icon} />
          <Text style={[styles.title, { color: theme === ThemeName.DARK ? '#fff' : '#111' }]} size="sm">
            {title}
          </Text>
        </View>
        <Text style={[styles.message, { color: theme === ThemeName.DARK ? '#e6e6e6' : '#444' }]} size="sm">
          {message}
        </Text>
        <View style={[
          styles.logoBox,
          { backgroundColor: backgroundColorDark }
        ]}>
          <Image
            source={{uri: Images.Logos.LeapLogo}}
            style={styles.logoImg}
            resizeMode="contain"
          />
        </View>
      </View>
      <Button onPress={onAction} style={styles.actionBtn} variant="mono">
        <Text style={{ color: theme === ThemeName.DARK ? '#111' : '#fff', fontWeight: 'bold' }}>
          Stake on a different chain
        </Text>
      </Button>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    gap: 8,
    width: '100%',
    padding: 16,
    borderRadius: 18,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  icon: {
    marginRight: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  message: {
    fontSize: 13,
    marginBottom: 2,
  },
  logoBox: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingVertical: 10,
  },
  logoImg: {
    width: 200,
    height: 106,
  },
  actionBtn: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 18,
    marginTop: 10,
  },
});
