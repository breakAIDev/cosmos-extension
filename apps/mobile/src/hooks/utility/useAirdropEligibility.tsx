import { useQuery } from '@tanstack/react-query';
import { CHECKED_NOBLE_AIRDROP_PUBKEYS } from '../../services/config/storage-keys';
import useActiveWallet from '../settings/useActiveWallet';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useAirdropEligibility() {
  const { activeWallet } = useActiveWallet();
  const noblePubKeys = activeWallet?.pubKeys?.noble;
  const [isEligible, setIsEligible] = useState(true);

  // Watch for changes in storage by polling (since AsyncStorage has no event listener)
  useEffect(() => {
    let polling: NodeJS.Timeout | null = null;
    const pollStorage = async () => {
      try {
        const value = await AsyncStorage.getItem(CHECKED_NOBLE_AIRDROP_PUBKEYS);
        if (value) {
          const parsed: string[] = JSON.parse(value);
          if (parsed.includes(noblePubKeys!)) {
            setIsEligible(false);
          }
        }
      } catch (err) {
        // Handle error
      }
    };

    pollStorage();
    polling = setInterval(pollStorage, 2000); // poll every 2s

    return () => {
      if (polling) clearInterval(polling);
    };
  }, [noblePubKeys]);

  const { status: eligibilityStatus } = useQuery(['airdropEligibility', noblePubKeys], async () => {
    const response = await fetch('https://assets.leapwallet.io/cosmos/noble/airdrop-wallets.json');
    const nobleAirdropWallets: { pub_key: { key: string } }[] = await response.json();

    const _isEligible = nobleAirdropWallets.some((wallet) => wallet.pub_key.key === noblePubKeys);
    setIsEligible(_isEligible);
  });

  return { isEligible, eligibilityStatus };
}
