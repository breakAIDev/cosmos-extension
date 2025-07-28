import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { observer } from 'mobx-react-lite';
import { ActivityHeader } from '../../screens/activity/components/activity-header';
import SelectChain from '../../screens/home/SelectChain';
import { Images } from '../../../assets/images';
import BottomNav, { BottomNavLabel } from '../bottom-nav/BottomNav';

type ComingSoonProps = {
  title: string;
  chainTagsStore: any; // or ChainTagsStore if available in your mobile project
  bottomNavLabel: BottomNavLabel; // or BottomNavLabel if you ported enums to RN
};

export const ComingSoon = observer(({ chainTagsStore, title, bottomNavLabel }: ComingSoonProps) => {
  const [showChainSelector, setShowChainSelector] = useState(false);

  return (
    <View style={styles.wrapper}>
      <ActivityHeader />
      <View style={styles.contentWrapper}>
        <View style={styles.card}>
          <Image
            source={Images.Logos.LeapLogo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="frog-coming-soon"
          />
          <Text style={styles.title}>Coming Soon!</Text>
          <Text style={styles.subtitle}>
            We&apos;re working on it. Or perhaps the chain is...{'\n'}
            Either way, this page is coming soon!
          </Text>
        </View>
      </View>
      <Modal
        visible={showChainSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowChainSelector(false)}
      >
        <SelectChain
          isVisible={showChainSelector}
          onClose={() => setShowChainSelector(false)}
          chainTagsStore={chainTagsStore}
        />
      </Modal>
      <TouchableOpacity onPress={() => setShowChainSelector(true)}>
        <Text>Change Chain</Text>
      </TouchableOpacity>
      <BottomNav label={bottomNavLabel} />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    padding: 24,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: '#F5F7FB', // secondary-100
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222B45',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#767F95',
    textAlign: 'center',
    lineHeight: 22,
  },
});
