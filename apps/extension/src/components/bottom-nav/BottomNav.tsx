import { useChainsStore, useFeatureFlags } from '@leapwallet/cosmos-wallet-hooks';
import { ThemeName, useTheme } from '@leapwallet/leap-ui';
import { ArrowsLeftRight, CurrencyDollar, Pulse, Wallet } from '@phosphor-icons/react';
import classNames from 'classnames';
import { LEAPBOARD_URL } from 'config/constants';
import { useActiveChain } from 'hooks/settings/useActiveChain';
import { Images } from 'images';
import { observer } from 'mobx-react-lite';
import BottomNavIcon from 'pages/alpha/components/BottomNavIcon';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export enum BottomNavLabel {
  Home = 'Home',
  NFTs = 'NFTs',
  Stake = 'Stake',
  Activity = 'Activity',
  Governance = 'Governance',
  Earn = 'Earn',
  Airdrops = 'Airdrops', // temporary deprecated
  Rewards = 'Rewards', // current successor to airdrops
  Swap = 'Swap',
  Search = 'Search',
}

type BottomNavProps = {
  label: BottomNavLabel;
  disabled?: boolean;
};

const BottomNav = observer(({ label, disabled: disabledAll }: BottomNavProps) => {
  const [selected, setSelected] = useState(label);
  const navigate = useNavigate();
  const activeChain = useActiveChain();
  const { chains } = useChainsStore();
  const activeChainInfo = chains[activeChain];
  const { data: featureFlags } = useFeatureFlags();
  const { theme } = useTheme();
  const isDark = theme === ThemeName.DARK;

  const alphaRedirectHandler = useCallback(() => {
    const redirectUrl = `${LEAPBOARD_URL}/airdrops`; // todo: change to alpha once added on leapboard
    window.open(redirectUrl, '_blank');
  }, []);

  const stakeRedirectForInitiaHandler = useCallback(() => {
    const redirectUrl = `https://app.testnet.initia.xyz/stake`;
    window.open(redirectUrl, '_blank');
  }, []);

  const bottomNavItems = useMemo(() => {
    const isSwapDisabled =
      featureFlags?.swaps?.extension === 'disabled' || ['nomic', 'seiDevnet'].includes(activeChain);

    return [
      {
        label: BottomNavLabel.Home,
        icon: <Wallet size={22} weight='fill' />,
        path: '/home',
        show: true,
      },
      {
        label: BottomNavLabel.Stake,
        icon: <CurrencyDollar size={22} weight='fill' />,
        path: '/stake?pageSource=bottomNav',
        show: true,
        disabled: activeChainInfo?.disableStaking || activeChainInfo?.evmOnlyChain,
        redirectHandler: stakeRedirectForInitiaHandler,
      },
      {
        label: BottomNavLabel.Swap,
        icon: <ArrowsLeftRight size={22} weight='bold' />,
        path: '/swap?pageSource=bottomNav',
        show: true,
        disabled: isSwapDisabled,
      },
      {
        label: BottomNavLabel.Rewards,
        icon: <BottomNavIcon />,
        path: '/alpha',
        show: featureFlags?.airdrops?.extension !== 'disabled',
        shouldRedirect: featureFlags?.airdrops?.extension === 'redirect',
        redirectHandler: alphaRedirectHandler,
      },
      {
        label: BottomNavLabel.Activity,
        icon: <Pulse size={22} weight='fill' />,
        path: '/activity',
        show: true,
      },
    ];
  }, [
    featureFlags?.swaps?.extension,
    featureFlags?.airdrops?.extension,
    activeChain,
    activeChainInfo?.disableStaking,
    activeChainInfo?.evmOnlyChain,
    stakeRedirectForInitiaHandler,
    alphaRedirectHandler,
  ]);

  return (
    <div className='flex absolute justify-around bottom-0 h-[65px] w-full rounded-b-lg z-[0] bg-white-100 dark:bg-gray-950 shadow-[0_-8px_20px_0px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_20px_0px_rgba(0,0,0,0.26)]'>
      <Images.Nav.BottomNav
        fill={isDark ? '#141414' : '#FFF'}
        stroke={isDark ? '#2C2C2C' : '#E8E8E8'}
        className='absolute bottom-0'
      />
      {bottomNavItems
        .filter(({ show }) => show)
        .map(({ label, icon, path, shouldRedirect, redirectHandler, disabled }, idx) => {
          const isDisabled = disabledAll || disabled;
          return (
            <div
              key={`${label}_${idx}`}
              onClick={() => {
                if (isDisabled) return;
                if (shouldRedirect === true && redirectHandler) {
                  redirectHandler();
                  return;
                }
                setSelected(label);
                navigate(path);
              }}
              className={classNames('flex flex-1 justify-center items-center cursor-pointer relative', {
                '!cursor-not-allowed': isDisabled,
              })}
            >
              {selected === label ? <div className='w-full h-1 bg-green-600 rounded-b absolute top-0'></div> : null}
              <div className='flex flex-col items-center justify-center'>
                {label === BottomNavLabel.Swap ? (
                  <div
                    style={{ fontSize: 24 }}
                    className={classNames('mt-[-20px] w-10 h-10 rounded-full flex items-center justify-center', {
                      'bg-green-600 text-white-100': !isDisabled,
                      'bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600': isDisabled,
                    })}
                  >
                    {icon}
                  </div>
                ) : (
                  <div
                    style={{ fontSize: 20 }}
                    className={classNames({
                      'text-black-100 dark:text-white-100': selected === label,
                      'text-gray-400 dark:text-gray-600': selected !== label,
                    })}
                  >
                    {icon}
                  </div>
                )}
                <div
                  className={classNames('text-xs font-bold mt-1', {
                    'text-black-100 dark:text-white-100': selected === label && !isDisabled,
                    'text-gray-400 dark:text-gray-600': selected !== label && !isDisabled,
                    'text-[#D3D3D3] dark:text-[#2C2C2C]': isDisabled,
                  })}
                >
                  {label}
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
});

export default BottomNav;
