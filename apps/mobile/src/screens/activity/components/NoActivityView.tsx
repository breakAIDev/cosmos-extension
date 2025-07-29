import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { EmptyCard } from '../../../components/empty-card';
import { Images } from '../../../../assets/images';
import { Colors } from '../../../theme/colors';

type NoActivityViewProps = {
  accountExplorerLink?: string;
  chain: SupportedChain;
};

export function NoActivityView({ accountExplorerLink }: NoActivityViewProps) {
  const openExplorer = () => {
    if (accountExplorerLink) {
      Linking.openURL(accountExplorerLink);
    }
  };

  return (
    <View style={styles.container}>
      <EmptyCard
        src={Images.Activity.ActivityIcon}
        heading="No activity"
        subHeading="Your activity will appear here"
      />

      {accountExplorerLink ? (
        <TouchableOpacity onPress={openExplorer}>
          <Text style={styles.explorerLink}>Check on Explorer</Text>
        </TouchableOpacity>
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
  explorerLink: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.green600,
  },
});
