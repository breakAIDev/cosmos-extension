import { Key } from '@leapwallet/cosmos-wallet-hooks';
import { CaretDown } from '@phosphor-icons/react';
import Text from 'components/text';
import { Images } from 'images';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { formatWalletName } from 'utils/formatWalletName';
import { trim } from 'utils/strings';

import { SelectWalletSheet } from './SelectWalletSheet';

type SearchChainWithWalletFilterProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSelectedWallet: (val: Key) => void;
  selectedWallet: Key;
};

export default function SearchChainWithWalletFilter({
  value,
  onChange,
  setSelectedWallet,
  selectedWallet,
}: SearchChainWithWalletFilterProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isWalletSheetVisible, setisWalletSheetVisible] = useState<boolean>(false);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, []);

  const walletName = formatWalletName(selectedWallet?.name || '');
  const walletAvatar = useMemo(() => {
    if (selectedWallet?.avatar) {
      return selectedWallet.avatar;
    } else {
      return Images.Misc.getWalletIconAtIndex(selectedWallet.colorIndex, selectedWallet.watchWallet);
    }
  }, [selectedWallet.avatar, selectedWallet.colorIndex, selectedWallet.watchWallet]);

  return (
    <div
      className={
        'rounded-2xl w-full flex gap-[10px] bg-gray-50 dark:bg-gray-900 py-3 pr-3 pl-4 focus-within:border-green-600 border border-transparent'
      }
    >
      <input
        placeholder={'Search chain'}
        className={
          'flex flex-1 min-[400px]:min-w-[160px] w-[50px] text-base outline-none bg-white-0 font-bold text-black-100 dark:text-white-100 text-md placeholder:font-medium dark:placeholder:text-gray-400 !leading-[21px]'
        }
        value={value}
        onChange={onChange}
        ref={inputRef}
      />

      <div
        className='flex items-center gap-2 bg-gray-50 dark:bg-gray-900 cursor-pointer border-l-2 border-gray-200 dark:border-gray-800 pl-4 pr-1 shrink-0'
        onClick={() => setisWalletSheetVisible(true)}
      >
        {walletAvatar ? (
          <img className='w-5 h-5 rounded-full' src={walletAvatar} alt='wallet-avatar' />
        ) : (
          <img className='w-5 h-5' src={Images.Logos.LeapLogo28} alt='wallet-avatar' />
        )}
        <Text size='sm' className='font-bold'>
          {trim(walletName, 8)}
        </Text>
        <CaretDown size={16} className='dark:text-white-100' />
      </div>

      <SelectWalletSheet
        isOpen={isWalletSheetVisible}
        onClose={() => setisWalletSheetVisible(false)}
        setSelectedWallet={setSelectedWallet}
        selectedWallet={selectedWallet}
      />
    </div>
  );
}
