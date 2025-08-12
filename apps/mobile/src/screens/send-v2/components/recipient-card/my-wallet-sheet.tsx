import React, { useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import {
  Key,
  SelectedAddress,
  useActiveChain,
} from '@leapwallet/cosmos-wallet-hooks';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { CardDivider } from '@leapwallet/leap-ui';
import BottomModal from '../../../../components/bottom-modal';
import { EmptyCard } from '../../../../components/empty-card';
import Loader from '../../../../components/loader/Loader';
import Text from '../../../../components/text';
import { SearchInput } from '../../../../components/ui/input/search-input';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import useQuery from '../../../../hooks/useQuery';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../../assets/images';
import { formatWalletName } from '../../../../utils/formatWalletName';
import { capitalize } from '../../../../utils/strings';
import { SendContextType, useSendContext } from '../../context';

type MyWalletSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  setSelectedAddress: (address: SelectedAddress) => void;
  skipSupportedDestinationChainsIDs: string[];
};

export const MyWalletSheet: React.FC<MyWalletSheetProps> = ({
  isOpen,
  onClose,
  setSelectedAddress,
  skipSupportedDestinationChainsIDs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedQuery = searchQuery.trim();

  const { displayAccounts: _displayMyAccounts, isIbcSupportDataLoading } =
    useSendContext() as SendContextType;

  const {
    activeWallet: { name, colorIndex, watchWallet },
  } = useActiveWallet() as {
    activeWallet: Key;
  };
  const activeChain = useActiveChain();
  const chainInfos = useChainInfos();
  const defaultTokenLogo = useDefaultTokenLogo();
  const activeWallet = useActiveWallet();

  const _displaySkipAccounts: any[][] = [];
  Object.keys(chainInfos).map((chain) => {
    if (
      skipSupportedDestinationChainsIDs?.includes(
        chainInfos[chain as SupportedChain]?.chainId,
      )
    ) {
      _displaySkipAccounts.push([
        chain,
        activeWallet?.activeWallet?.addresses?.[chain as SupportedChain],
      ]);
    }
  });

  const _displayAccounts =
    _displaySkipAccounts.length > 0 ? _displaySkipAccounts : _displayMyAccounts;

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
      const chainKey = Object.values(chainInfos).find(
        (chain) => chain.chainId === toChainId,
      )?.key;
      const toChain = displayAccounts.filter(([_chain]) => _chain === chainKey)?.[0];
      const img = chainInfos[chainKey as SupportedChain]?.chainSymbolImageUrl ?? defaultTokenLogo;

      setSelectedAddress({
        address: toChain?.[1],
        avatarIcon: Images.Misc.getWalletIconAtIndex(colorIndex, watchWallet),
        chainIcon: img ?? '',
        chainName: toChain?.[0],
        emoji: undefined,
        name: `${name.length > 12 ? `${name.slice(0, 12)}...` : name} - ${capitalize(toChain?.[0])}`,
        selectionType: 'currentWallet',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toChainId, displayAccounts?.length > 0, activeChain]);

  return (
    <BottomModal isOpen={isOpen} closeOnBackdropClick title="Choose Recipient Wallet" onClose={onClose}>
      <View>
        {isIbcSupportDataLoading ? (
          <View style={styles.loadingCard}>
            <Text size="xs" style={styles.loadingText}>
              Loading IBC Supported Chains
            </Text>
            <Loader />
          </View>
        ) : (
          <>
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search chains..."
            />
            <View style={styles.resultCard}>
              {displayAccounts.length > 0 ? (
                <>
                  <View style={styles.titleRow}>
                    <Text size="xs" style={styles.listTitle}>
                      Other chains in current wallet: {formatWalletName(name)}
                    </Text>
                  </View>
                  <ScrollView style={{ marginTop: 8, maxHeight: 330 }}>
                    {displayAccounts.map(([_chain, address], index) => {
                      const chain = _chain as unknown as SupportedChain;
                      const img = chainInfos[chain]?.chainSymbolImageUrl ?? defaultTokenLogo;
                      const chainName = chainInfos[chain]?.chainName ?? chain;
                      const isLast = index === displayAccounts.length - 1;

                      return (
                        <View key={_chain}>
                          <TouchableOpacity
                            style={[
                              styles.walletButton,
                              (index === 0 || isLast) && styles.roundedButton,
                            ]}
                            activeOpacity={0.75}
                            onPress={() => {
                              setSelectedAddress({
                                address: address,
                                avatarIcon: Images.Misc.getWalletIconAtIndex(colorIndex, watchWallet),
                                chainIcon: img ?? '',
                                chainName: chain,
                                emoji: undefined,
                                name: `${name.length > 12 ? `${name.slice(0, 12)}...` : name} - ${chainName}`,
                                selectionType: 'currentWallet',
                              });
                              onClose();
                            }}
                          >
                            <Image
                              source={typeof img === 'string' ? { uri: img } : img}
                              style={styles.walletIcon}
                            />
                            <Text style={styles.walletName}>{chainName}</Text>
                            <Image source={{uri: Images.Misc.RightArrow}} style={styles.rightArrow} />
                          </TouchableOpacity>
                          {!isLast && (
                            <View style={styles.dividerWrap}>
                              <CardDivider />
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>
                </>
              ) : (
                <EmptyCard
                  src={trimmedQuery.length > 0 ? Images.Misc.NoSearchResult : Images.Misc.Blockchain}
                  heading="No Chain Found"
                  subHeading={
                    trimmedQuery.length > 0
                      ? `No chains found for "${trimmedQuery}"`
                      : `No chains support IBC with ${chainInfos[activeChain].chainName}`
                  }
                  style={{
                    paddingHorizontal: 0,
                    paddingVertical: 20,
                    width: '100%',
                    justifyContent: 'center',
                  }}
                />
              )}
            </View>
          </>
        )}
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    height: 192,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  loadingText: {
    color: '#999',
    fontWeight: 'bold',
    padding: 4,
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    position: 'relative',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    color: '#888',
    fontWeight: 'bold',
    padding: 4,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'transparent',
  },
  roundedButton: {
    borderRadius: 16,
  },
  walletIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ececec',
    marginRight: 10,
  },
  walletName: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 15,
    textTransform: 'capitalize',
    marginLeft: 8,
  },
  rightArrow: {
    marginLeft: 'auto',
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  dividerWrap: {
    width: '100%',
  },
});

export default MyWalletSheet;
