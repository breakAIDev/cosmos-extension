import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { Key, SelectedAddress, useChainInfo, useGetChains, WALLETTYPE } from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { Question } from 'phosphor-react-native';
import Loader from '../../../../components/loader/Loader';
import Text from '../../../../components/text';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import useQuery from '../../../../hooks/useQuery';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../../assets/images';
import { useSendContext } from '../../../send-v2/context';
import { getLedgerEnabledEvmChainsKey } from '../../../../utils/getLedgerEnabledEvmChains';
import { isLedgerEnabled } from '../../../../utils/isLedgerEnabled';
import { capitalize, sliceAddress } from '../../../../utils/strings';

import SearchChainWithWalletFilter from './SearchChainWithWalletFilter';

interface MyWalletsProps {
  setSelectedAddress: (address: SelectedAddress) => void;
  skipSupportedDestinationChainsIDs: string[];
}

function MyWallets({ skipSupportedDestinationChainsIDs, setSelectedAddress }: MyWalletsProps) {
  const { displayAccounts: _displayMyAccounts, isIbcSupportDataLoading, sendActiveChain } = useSendContext();
  const chainInfos = useChainInfos();
  const activeWallet = useActiveWallet();
  const defaultTokenLogo = useDefaultTokenLogo();
  const chains = useGetChains();
  const activeChainInfo = useChainInfo(sendActiveChain);

  const ledgerEnabledEvmChainsKeys = useMemo(() => {
    return getLedgerEnabledEvmChainsKey(Object.values(chains));
  }, [chains]);

  const ledgerApp = useMemo(() => {
    return ledgerEnabledEvmChainsKeys.includes(activeChainInfo?.key) ? 'EVM' : 'Cosmos';
  }, [activeChainInfo?.key, ledgerEnabledEvmChainsKeys]);

  const [selectedWallet, setSelectedWallet] = useState<Key | null>(activeWallet?.activeWallet);
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedQuery = searchQuery.trim();

  // Compose display accounts
  const _displaySkipAccounts: any[][] = [];
  Object.keys(chainInfos).map((chain) => {
    if (skipSupportedDestinationChainsIDs?.includes(chainInfos[chain as SupportedChain]?.chainId)) {
      _displaySkipAccounts.push([chain, selectedWallet?.addresses?.[chain as SupportedChain]]);
    }
  });

  const _displayAccounts = _displaySkipAccounts.length > 0 ? _displaySkipAccounts : _displayMyAccounts;

  const { name, colorIndex, watchWallet } = selectedWallet as Key;

  const displayAccounts = useMemo(
    () =>
      _displayAccounts.filter(([chain]) => {
        const chainName = chainInfos[chain as SupportedChain]?.chainName ?? chain;
        return chainName.toLowerCase().includes(trimmedQuery.toLowerCase());
      }),
    [_displayAccounts, chainInfos, trimmedQuery],
  );

  const toChainId = useQuery().get('toChainId') ?? undefined;

  useEffect(() => {
    if (toChainId && displayAccounts?.length > 0) {
      const chainKey = Object.values(chainInfos).find((chain) => chain.chainId === toChainId)?.key;
      const toChain = displayAccounts.filter(([_chain]) => _chain === chainKey)?.[0];
      const img = chainInfos[chainKey as SupportedChain]?.chainSymbolImageUrl ?? defaultTokenLogo;

      setSelectedAddress({
        address: toChain?.[1],
        avatarIcon: Images.Misc.getWalletIconAtIndex(colorIndex, watchWallet),
        chainIcon: img ?? '',
        chainName: toChain?.[0],
        emoji: undefined,
        name: `${name.length > 12 ? `${name.slice(0, 12)}...` : name} - ${capitalize(
          toChain?.[0] === 'seiTestnet2' ? 'sei' : toChain?.[0],
        )}`,
        selectionType: 'currentWallet',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toChainId, displayAccounts?.length > 0, sendActiveChain]);

  if (isIbcSupportDataLoading) {
    return (
      <View style={styles.loaderContainer}>
        <Text size="xs" style={[styles.p1, styles.fontBold, styles.textGray]}>
          Loading IBC Supported Chains
        </Text>
        <Loader />
      </View>
    );
  }

  return (
    <>
      <SearchChainWithWalletFilter
        value={searchQuery}
        onChange={setSearchQuery}
        setSelectedWallet={setSelectedWallet}
        selectedWallet={selectedWallet as Key}
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {displayAccounts.length > 0 ? (
          displayAccounts.map(([_chain, address], index) => {
            const chain = _chain as unknown as SupportedChain;
            const chainInfo = chainInfos[chain];
            const img = chainInfo?.chainSymbolImageUrl ?? defaultTokenLogo;
            const chainName = chainInfo?.chainName ?? chain;
            const isLast = index === displayAccounts.length - 1;

            let addressText = '';
            if (
              selectedWallet?.walletType === WALLETTYPE.LEDGER &&
              !isLedgerEnabled(chainInfo.key, chainInfo.bip44.coinType, Object.values(chainInfos))
            ) {
              addressText = `Ledger not supported on ${chainInfo.chainName}`;
            }
            if (
              selectedWallet?.walletType === WALLETTYPE.LEDGER &&
              isLedgerEnabled(chainInfo.key, chainInfo.bip44.coinType, Object.values(chainInfos)) &&
              !address
            ) {
              addressText = `Please import ${ledgerApp} wallet`;
            }

            return (
              <React.Fragment key={_chain}>
                <TouchableOpacity
                  style={[styles.accountRow, !!addressText && styles.disabledRow]}
                  onPress={() => {
                    setSelectedAddress({
                      address: address,
                      avatarIcon: Images.Misc.getWalletIconAtIndex(colorIndex, watchWallet),
                      chainIcon: img ?? '',
                      chainName: chain,
                      emoji: undefined,
                      name: `${name.length > 12 ? `${name.slice(0, 12)}...` : name} - ${capitalize(
                        chain === 'seiTestnet2' ? 'sei' : chain,
                      )}`,
                      selectionType: 'currentWallet',
                    });
                  }}
                  disabled={!!addressText}
                  activeOpacity={!!addressText ? 1 : 0.7}
                >
                  <Image
                    source={typeof img === 'string' ? { uri: img } : img}
                    alt={`${chainName} logo`}
                    style={styles.accountIcon}
                  />
                  <View style={styles.accountTextWrap}>
                    <Text style={styles.chainNameText}>{chainName}</Text>
                    <Text style={styles.addressText}>
                      {addressText || sliceAddress(address)}
                    </Text>
                  </View>
                </TouchableOpacity>
                {!isLast && <View style={styles.divider} />}
              </React.Fragment>
            );
          })
        ) : (
          <View style={styles.noChainsContainer}>
            <Question size={40} color="#fff" style={{ marginBottom: 10 }} />
            <View style={styles.noChainsTextWrap}>
              <Text style={styles.noChainsTitle}>
                {trimmedQuery.length > 0
                  ? `No chains found for "${trimmedQuery}"`
                  : `No chains support IBC with ${chainInfos[sendActiveChain].chainName}`}
              </Text>
              <Text style={styles.noChainsSub}>
                Try searching for a different term
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    backgroundColor: '#F3F4F6', // bg-white-100
    borderRadius: 16,
    padding: 12,
    minHeight: 192,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  p1: {
    padding: 4,
  },
  fontBold: {
    fontWeight: 'bold',
  },
  textGray: {
    color: '#6B7280',
  },
  scrollContainer: {
    flex: 1,
    marginTop: 16,
    maxHeight: 320, // h-[calc(100%-300px)]
  },
  scrollContent: {
    paddingBottom: 16,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    width: '100%',
  },
  disabledRow: {
    opacity: 0.5,
  },
  accountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 8,
  },
  accountTextWrap: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  chainNameText: {
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-700
    textAlign: 'left',
    textTransform: 'capitalize',
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280', // text-gray-600
    textAlign: 'left',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    width: '100%',
  },
  noChainsContainer: {
    paddingVertical: 40,
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  noChainsTextWrap: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  noChainsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 21.5,
    color: '#fff',
    marginBottom: 2,
  },
  noChainsSub: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22.4,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});

export default MyWallets;
