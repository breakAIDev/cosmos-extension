import { WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { CardDivider, NavCard, ThemeName, useTheme } from '@leapwallet/leap-ui';
import { useAuth } from 'context/auth-context';
import useActiveWallet from 'hooks/settings/useActiveWallet';
import { Images } from 'images';
import { observer } from 'mobx-react-lite';
import React, { useMemo } from 'react';
import { globalSheetsStore } from 'stores/ui/global-sheets-store';
import { DEBUG } from 'utils/debug';

import { NavPages, SideNavSection, SideNavSectionHeader } from '.';

export const Security = observer(
  ({ setShowNavPage, openGSDropUp }: { setShowNavPage: (page: NavPages) => void; openGSDropUp: () => void }) => {
    const auth = useAuth();
    const { theme } = useTheme();
    const isDark = theme === ThemeName.DARK;

    const { activeWallet } = useActiveWallet();

    const Privacy = useMemo(
      () => [
        {
          title: 'Security',
          titleIcon: Images.Nav.LockTimer,
          onClick: openGSDropUp,
          enabled: true,
        },
        {
          title: 'Show Recovery Phrase',
          titleIcon: Images.Nav.SecretPhrase,
          onClick: () => setShowNavPage(NavPages.ExportSeedPhrase),
          enabled:
            !activeWallet?.watchWallet &&
            (activeWallet?.walletType === WALLETTYPE.SEED_PHRASE ||
              activeWallet?.walletType === WALLETTYPE.SEED_PHRASE_IMPORTED),
          'data-testing-id': 'sidenav-show-secret-phrase-card',
        },
        {
          title: 'Export Private Key',
          titleIcon: isDark ? Images.Nav.SecretKeyDark : Images.Nav.SecretKeyLight,
          onClick: () => setShowNavPage(NavPages.ExportPrivateKey),
          enabled: !activeWallet?.watchWallet && activeWallet?.walletType !== WALLETTYPE.LEDGER,
        },
        {
          title: 'Lock Wallet',
          titleIcon: Images.Nav.Lock,
          onClick: () => {
            auth?.signout(() => {
              DEBUG('SideNav', 'SignOut', 'success');
            });
            globalSheetsStore.setSideNavOpen(false);
          },
          enabled: true,
          'data-testing-id': 'sidenav-lock-wallet-card',
        },
      ],
      [activeWallet, auth, isDark, openGSDropUp, setShowNavPage],
    );

    return (
      <SideNavSection>
        <SideNavSectionHeader>Security</SideNavSectionHeader>
        {Privacy.filter((item) => item.enabled).map((item, index) => {
          return (
            <React.Fragment key={item.title}>
              {index !== 0 && <CardDivider />}
              <NavCard
                property={item.title}
                imgSrc={item.titleIcon}
                onClick={item.onClick}
                data-testing-id={item['data-testing-id'] ?? ''}
              />
            </React.Fragment>
          );
        })}
      </SideNavSection>
    );
  },
);
