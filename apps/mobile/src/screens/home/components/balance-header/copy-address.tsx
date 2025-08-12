import React, { useMemo, useState } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'phosphor-react-native';
import { AGGREGATED_CHAIN_KEY } from '../../../../services/config/constants';
import { useActiveChain } from '../../../../hooks/settings/useActiveChain';
import { useActiveWallet } from '@leapwallet/cosmos-wallet-hooks';
import { useGetWalletAddresses } from '../../../../hooks/useGetWalletAddresses';
import { useQueryParams } from '../../../../hooks/useQuery';
import { CopyIcon } from '../../../../../assets/icons/copy-icon';
import { observer } from 'mobx-react-lite';
import { UserClipboard } from '../../../../utils/clipboard';
import { MotiView } from 'moti';
import { queryParams } from '../../../../utils/query-params';

export const CopyAddress = observer(() => {
  const activeChain = useActiveChain();
  const activeWallet = useActiveWallet();
  const walletAddresses = useGetWalletAddresses();

  const query = useQueryParams();

  const [isWalletAddressCopied, setIsWalletAddressCopied] = useState(false);

  const showCopySheet = walletAddresses?.length > 1 || (activeChain as string) === AGGREGATED_CHAIN_KEY;

  const address = useMemo(() => {
    if (!activeWallet || !walletAddresses?.[0] || showCopySheet) {
      return 'copy address';
    }
    return walletAddresses[0].slice(0, 7) + '...' + walletAddresses[0].slice(-6); // mimic sliceAddress
  }, [activeWallet, showCopySheet, walletAddresses]);

  const handleCopyAddress = () => {
    if (showCopySheet) {
      // Trigger navigation or modal for address selection
      query.set(queryParams.copyAddress, 'true');
      return;
    }
    setIsWalletAddressCopied(true);
    setTimeout(() => setIsWalletAddressCopied(false), 2000);
    UserClipboard.copyText(walletAddresses?.[0] || '');
  };

  if (!address && (activeChain as string) !== AGGREGATED_CHAIN_KEY) {
    return null;
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'timing', duration: 150 }}
      style={{ alignSelf: 'flex-start' }}
    >
      <Pressable
        onPress={handleCopyAddress}
        style={({ pressed }) => [
          styles.container,
          isWalletAddressCopied && styles.copied,
          pressed && !isWalletAddressCopied && styles.pressed,
        ]}
      >
        <Text style={[styles.text, isWalletAddressCopied && styles.textCopied]}>
          {isWalletAddressCopied ? 'Copied!' : address}
        </Text>
        {isWalletAddressCopied ? (
          <Check size={16} color="#007AFF" style={styles.icon} />
        ) : (
          <CopyIcon size={16} color="#A0A0A0" style={styles.icon} />
        )}
      </Pressable>
    </MotiView>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginVertical: 2,
  },
  copied: {
    borderColor: '#007AFF',
    backgroundColor: '#E6F4F1',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: '#F2F2F2',
  },
  text: {
    fontSize: 12,
    color: '#6C6C6C',
    marginRight: 6,
    fontFamily: 'DMMono-Regular', // Only if you load this font!
  },
  textCopied: {
    color: '#007AFF',
  },
  icon: {
    marginLeft: 2,
  },
});
