import { getBlockChainFromAddress, isValidWalletAddress } from '@leapwallet/cosmos-wallet-sdk';
import { KeyChain } from '@leapwallet/leap-keychain';
import SelectWalletColors from 'components/create-wallet-form/SelectWalletColors';
import BottomModal from 'components/new-bottom-modal';
import { Button } from 'components/ui/button';
import { Input } from 'components/ui/input';
import { Textarea } from 'components/ui/input/textarea';
import { LEDGER_NAME_EDITED_SUFFIX_REGEX } from 'config/config';
import { useChainInfos } from 'hooks/useChainInfos';
import React, { useEffect, useRef, useState } from 'react';
import { passwordStore } from 'stores/password-store';

import { Wallet } from '../../hooks/wallet/useWallet';
import { getWalletName } from './utils/wallet-names';
import { WatchWalletAvatar } from './WalletCardWrapper';

type ImportWatchAddressProps = {
  isVisible: boolean;
  
  onClose: (closeParent: boolean) => void;
};

export default function ImportWatchWallet({ isVisible, onClose }: ImportWatchAddressProps) {
  const wallets = Wallet.useWallets();
  const [watchAddress, setWatchAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const password = passwordStore.password;
  const saveWatchWallet = Wallet.useSaveWatchWallet();
  const chainInfos = useChainInfos();
  const shouldAutoFillName = useRef(true);
  const [colorIndex, setColorIndex] = useState(0);

  const onChangeHandler = (value: string) => {
    setError('');
    setWatchAddress(value);
  };

  const handleImportWallet = async () => {
    setIsLoading(true);

    if (watchAddress && password && !error) {
      try {
        await saveWatchWallet(watchAddress, walletName);
        setWatchAddress('');
        setWalletName('');
        shouldAutoFillName.current = true;
        onClose(true);
      } catch (error: any) {
        setError(error.message);
      }
    }

    setIsLoading(false);
  };

  const handleClose = () => {
    onClose(false);
    setError('');
    setWatchAddress('');
    setWalletName('');
    shouldAutoFillName.current = true;
  };

  useEffect(() => {
    async function validate() {
      if (!watchAddress) {
        setError('');
        return;
      }
      if (!isValidWalletAddress(watchAddress)) {
        setError('Invalid public address, please enter a valid address');
        return;
      }

      const prefix = getBlockChainFromAddress(watchAddress);
      const chain = Object.values(chainInfos).find((chain) => chain.addressPrefix === prefix);
      const wallets = await KeyChain.getAllWallets();
      const addresses = Object.values(wallets).reduce((acc, wallet) => {
        if (chain) {
          const existingAddress = wallet.addresses[chain?.key];
          if (existingAddress) {
            acc.push(existingAddress);
          }
        }
        return acc;
      }, [] as string[]);
      if (addresses.includes(watchAddress)) {
        setError('This address already exists in your wallet');
        return;
      }
      setError('');
    }
    validate();
  }, [chainInfos, watchAddress]);

  useEffect(() => {
    if (isVisible && shouldAutoFillName.current) {
      setWalletName(
        getWalletName(
          Object.values(wallets || {}).filter((wallet) => wallet.watchWallet),
          'Watch Wallet',
        ),
      );
      shouldAutoFillName.current = false;
    }
  }, [wallets, isVisible]);

  return (
    <BottomModal
      fullScreen
      isOpen={isVisible}
      title='Watch wallet'
      onClose={handleClose}
      footerComponent={
        <>
          <Button variant='secondary' size='md' className='flex-1' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            size='md'
            className='flex-1'
            disabled={!watchAddress || !!error || isLoading}
            onClick={handleImportWallet}
          >
            Watch Wallet
          </Button>
        </>
      }
    >
      <div className='flex flex-col p-6 justify-between items-center gap-4 bg-secondary-50 rounded-xl'>
        <WatchWalletAvatar
          colorIndex={colorIndex}
          className='size-20 rounded-full transition-colors duration-300'
          iconClassName='size-10'
        />

        <Textarea
          className='w-full h-[7.5rem] resize-none'
          placeholder='Public address'
          spellCheck={false}
          autoFocus={isVisible}
          onChange={(e) => onChangeHandler(e.target.value)}
          status={error ? 'error' : undefined}
        />

        <Input
          maxLength={24}
          spellCheck={false}
          placeholder='Enter wallet name'
          value={walletName.replace(LEDGER_NAME_EDITED_SUFFIX_REGEX, '')}
          onChange={(e) => setWalletName(e.target.value)}
          trailingElement={
            walletName.length > 0 ? (
              <div className='text-muted-foreground text-sm font-medium'>{`${walletName.length}/24`}</div>
            ) : null
          }
        />

        {error && <span className='font-medium text-destructive-200 text-sm mx-auto'>{error}</span>}

        <SelectWalletColors selectColorIndex={setColorIndex} colorIndex={colorIndex} />
      </div>
    </BottomModal>
  );
}
