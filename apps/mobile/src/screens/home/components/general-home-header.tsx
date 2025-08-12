import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Image } from 'react-native';
import { CaretDown } from 'phosphor-react-native';
import { WalletButtonV2 } from '../../../components/button';
import { PageHeader } from '../../../components/header/PageHeaderV2';
import { SideNavMenuOpen } from '../../../components/header/sidenav-menu';
import { useDefaultTokenLogo } from '../../../hooks';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import useQuery from '../../../hooks/useQuery';
import { useWalletInfo } from '../../../hooks/useWalletInfo';
import { useChainPageInfo } from '../../../hooks/utility/useChainPageInfo';
import { observer } from 'mobx-react-lite';
// Skeleton replacement:
import { ActivityIndicator as Skeleton } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // React Native Navigation or react-navigation
import { earnFeatureShowStore } from '../../../context/earn-feature-show';
import { globalSheetsStore } from '../../../context/global-sheets-store';
import SelectChain from '../SelectChain';
import SelectWallet from '../SelectWallet/v2';
import EarnUSDNSheet from './EarnUSDNSheet';

const GeneralHomeHeaderView = (props: { disableWalletButton?: boolean; isLoading?: boolean }) => {
  const [showSelectWallet, setShowSelectWallet] = useState(false);
  const [defaultFilter, setDefaultFilter] = useState<string | undefined>(undefined);
  const [showEarnUSDN, setShowEarnUSDN] = useState(false);

  const walletInfo = useWalletInfo();
  const query = useQuery();
  const navigation = useNavigation();
  const activeChain = useActiveChain();
  const { headerChainImgSrc } = useChainPageInfo();
  const defaultTokenLogo = useDefaultTokenLogo();

  // Equivalent to web's useEffect for setting filter
  useEffect(() => {
    if (!globalSheetsStore.isChainSelectorOpen) setDefaultFilter('Popular');
  }, []);

  // Deep links
  useEffect(() => {
    if (query.get('openChainSwitch')) {
      const _defaultFilter = query.get('defaultFilter');
      navigation.navigate('Home'); // Or navigation.replace('Home');
      globalSheetsStore.toggleChainSelector();
      if (_defaultFilter) setDefaultFilter(_defaultFilter);
      return;
    }
    if (query.get('openLightNode')) {
      navigation.navigate('Home');
      globalSheetsStore.toggleSideNav({ openLightNodePage: true });
      return;
    }
    if (query.get('openEarnUSDN')) {
      earnFeatureShowStore.show !== 'false'
        ? setShowEarnUSDN(true)
        : navigation.navigate('EarnUsdn', { replace: true });
      return;
    }
  }, [navigation, query]);

  return (
    <>
      <PageHeader>
        <SideNavMenuOpen
          style={{ paddingVertical: 8, paddingLeft: 10, paddingRight: 6, color: '#6b7280' }}
        />

        <WalletButtonV2
          showDropdown
          showWalletAvatar
          style={{
            position: 'absolute',
            top: '50%',
            right: '50%',
            transform: [{ translateY: -0.5 }, { translateX: 0.5 }],
          }}
          walletName={walletInfo.walletName}
          walletAvatar={walletInfo.walletAvatar}
          handleDropdownClick={() => setShowSelectWallet(!props.disableWalletButton)}
        />

        <TouchableOpacity
          style={{
            backgroundColor: '#F3F4F6',
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
          }}
          onPress={() => globalSheetsStore.toggleChainSelector()}
          key={activeChain}
        >
          {!props.isLoading ? (
            <Image
              source={{ uri: headerChainImgSrc || defaultTokenLogo }}
              style={{ width: 20, height: 20, borderRadius: 10, overflow: 'hidden' }}
              defaultSource={{ uri: defaultTokenLogo }}
              onError={() => {}}
            />
          ) : (
            <Skeleton size="small" color="#e5e7eb" />
          )}
          <CaretDown weight="fill" size={12} color="#9ca3af" />
        </TouchableOpacity>
      </PageHeader>

      <SelectWallet isVisible={showSelectWallet} onClose={() => setShowSelectWallet(false)} />

      <SelectChain
        isVisible={globalSheetsStore.isChainSelectorOpen}
        onClose={() => globalSheetsStore.toggleChainSelector()}
        defaultFilter={defaultFilter}
      />

      {showEarnUSDN && (
        <EarnUSDNSheet
          onClose={() => {
            setShowEarnUSDN(false);
            navigation.navigate('Home', { replace: true });
          } }
          visible={false}
        />
      )}
    </>
  );
};

GeneralHomeHeaderView.displayName = 'GeneralHomeHeader';

export const GeneralHomeHeader = observer(GeneralHomeHeaderView);
