import { WalletButtonV2 } from 'components/button';
import { PageHeader } from 'components/header/PageHeaderV2';
import { SideNavMenuOpen } from 'components/header/sidenav-menu';
import { useWalletInfo } from 'hooks/useWalletInfo';
import { FilterIcon } from 'icons/filter-icon';
import { observer } from 'mobx-react-lite';
import SelectWallet from 'pages/home/SelectWallet/v2';
import React, { useState } from 'react';

const SwapHeaderView = (props: { onSettings?: () => void; currentSlippage: number }) => {
  const [showSelectWallet, setShowSelectWallet] = useState(false);
  const walletInfo = useWalletInfo();

  return (
    <>
      <PageHeader>
        <SideNavMenuOpen className='py-2 pr-1.5 pl-2.5 text-foreground/75 hover:text-foreground transition-colors' />

        <WalletButtonV2
          showDropdown
          showWalletAvatar
          className='absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2'
          walletName={walletInfo.walletName}
          walletAvatar={walletInfo.walletAvatar}
          handleDropdownClick={() => setShowSelectWallet(true)}
        />

        <button className='flex items-center gap-[2px]' onClick={props.onSettings}>
          <FilterIcon fill='var(--foreground)' size={24} />
          <p className='text-sm font-bold text-foreground'>{props.currentSlippage}%</p>
        </button>
      </PageHeader>

      <SelectWallet isVisible={showSelectWallet} onClose={() => setShowSelectWallet(false)} />
    </>
  );
};

SwapHeaderView.displayName = 'SwapHeader';

export const SwapHeader = observer(SwapHeaderView);
