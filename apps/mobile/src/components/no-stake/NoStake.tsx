import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Header, HeaderActionType } from '@leapwallet/leap-ui'; // should be adapted for RN
import Text from '../text';
import PopupLayout from '../layout/popup-layout';
import BottomNav from '../bottom-nav/BottomNav'; // assumed RN-compatible
import { Images } from '../../../assets/images';
import SelectChain from '../../screens/home/SelectChain';
import { useChainPageInfo } from '../../hooks';
import { useDontShowSelectChain } from '../../hooks/useDontShowSelectChain';
import { globalSheetsStore } from '../../context/global-sheets-store';
import { chainTagsStore } from '../../context/chain-infos-store';
import { manageChainsStore } from '../../context/manage-chains-store';

export const NoStake = observer(() => {
  const [showChainSelector, setShowChainSelector] = useState(false);
  const { headerChainImgSrc } = useChainPageInfo();
  const dontShowSelectChain = useDontShowSelectChain(manageChainsStore);

  return (
    <View style={styles.wrapper}>
      <PopupLayout
        header={
          <Header
            title="Staking"
            imgSrc={headerChainImgSrc}
            onImgClick={
              dontShowSelectChain ? undefined : () => setShowChainSelector(true)
            }
            action={{
              type: HeaderActionType.NAVIGATION,
              onClick: () => globalSheetsStore.toggleSideNav(),
              className:
                'min-w-[48px] h-[36px] px-2 bg-white dark:bg-gray-900 rounded-full', // optional, may be replaced with a `style` prop
            }}
          />
        }
      >
        <View style={styles.content}>
          <Image
            source={Images.Stake.NoStakeSVG}
            style={styles.image}
            resizeMode="contain"
          />
          <Text size="lg" style={styles.title}>
            Staking not available
          </Text>
          <Text size="md" color="text-gray-300" style={styles.subtitle}>
            This chain does not support staking due to its underlying design
          </Text>
        </View>
      </PopupLayout>

      <SelectChain
        isVisible={showChainSelector}
        chainTagsStore={chainTagsStore}
        onClose={() => setShowChainSelector(false)}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  image: {
    height: 240,
    width: 240,
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    maxWidth: 300,
    color: '#9ca3af', // fallback if `color` prop doesn't map to text-gray-300
  },
});
