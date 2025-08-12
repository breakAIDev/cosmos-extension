import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BookmarkSimple } from 'phosphor-react-native';
import { observer } from 'mobx-react-lite';

// Import your RN components
import { WalletButtonV2 } from '../../components/button';
import { PageHeader } from '../../components/header/PageHeaderV2';
import { SideNavMenuOpen } from '../../components/header/sidenav-menu';
import SelectWallet from '../home/SelectWallet/v2';

// Import logic/hooks (replace with appropriate RN navigation/params solution)
import { useWalletInfo } from '../../hooks/useWalletInfo';
import { EventName, PageName } from '../../services/config/analytics';
import { mixpanelTrack } from '../../utils/tracking';

import { ALPHA_BOOKMARK_CLONE_ID, ALPHA_BOOKMARK_ID } from './utils/constants';

const BookmarkCta = () => {
  const [showBookmarks, setShowBookmarks] = useState(false);
  const toggleBookmarks = () => setShowBookmarks((prev) => !prev);

  return (
    <TouchableOpacity
      style={styles.bookmarkButton}
      onPress={() => {
        toggleBookmarks();
        mixpanelTrack(EventName.PageView, {
          pageName: PageName.Bookmark,
        });
      }}
      activeOpacity={0.7}
    >
      <BookmarkSimple testID={ALPHA_BOOKMARK_ID} size={20} color="#555" />
      {/* You can conditionally render the filled bookmark */}
      {showBookmarks && (
        <BookmarkSimple
          testID={ALPHA_BOOKMARK_CLONE_ID}
          weight="fill"
          size={20}
          color="#555"
          style={{ marginLeft: 4 }}
        />
      )}
    </TouchableOpacity>
  );
};

const AlphaHeaderView = (props: { disableWalletButton?: boolean }) => {
  const [showSelectWallet, setShowSelectWallet] = useState(false);
  const walletInfo = useWalletInfo();

  return (
    <>
      <PageHeader>
        <SideNavMenuOpen style={styles.sideNavIcon} />

        <WalletButtonV2
          showDropdown
          showWalletAvatar
          style={styles.walletButton}
          walletName={walletInfo.walletName}
          walletAvatar={walletInfo.walletAvatar}
          handleDropdownClick={() => setShowSelectWallet(!props.disableWalletButton)}
        />

        <BookmarkCta />
      </PageHeader>

      <SelectWallet isVisible={showSelectWallet} onClose={() => setShowSelectWallet(false)} />
    </>
  );
};

AlphaHeaderView.displayName = 'AlphaHeaderView';

export const AlphaHeader = observer(AlphaHeaderView);

const styles = StyleSheet.create({
  bookmarkButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sideNavIcon: {
    paddingVertical: 8,
    paddingRight: 6,
    paddingLeft: 10,
  },
  walletButton: {
    position: 'absolute',
    top: '50%',
    right: '50%',
    transform: [{ translateX: 0.5 }, { translateY: -0.5 }], // You may need to adjust for RN
  },
});
