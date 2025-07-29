import React from 'react';
import { View, Image, Text, Linking, Pressable, StyleSheet } from 'react-native';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Images } from '../../../../assets/images';
import { Colors } from '../../../theme/colors';

type ErrorActivityViewProps = {
  accountExplorerLink: string;
  chain: SupportedChain;
};

export function ErrorActivityView({ accountExplorerLink }: ErrorActivityViewProps) {
  const openExplorer = () => {
    if (accountExplorerLink) {
      Linking.openURL(accountExplorerLink);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={Images.Activity.ActivityIcon} style={styles.image} resizeMode="contain" />
      <Text style={styles.heading}>Unable to fetch activity</Text>

      {accountExplorerLink ? (
        <Pressable onPress={openExplorer}>
          <Text style={styles.explorerLink}>Check on Explorer</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 350,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  explorerLink: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.green600,
  },
});
