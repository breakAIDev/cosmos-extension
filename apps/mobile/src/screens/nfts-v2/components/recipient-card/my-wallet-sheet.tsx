import React, { useMemo, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import BottomModal from '../../../../components/bottom-modal';
import { EmptyCard } from '../../../../components/empty-card';
import Loader from '../../../../components/loader/Loader';
import Text from '../../../../components/text';
import useActiveWallet from '../../../../hooks/settings/useActiveWallet';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { useDefaultTokenLogo } from '../../../../hooks/utility/useDefaultTokenLogo';
import { Images } from '../../../../../assets/images';
import { formatWalletName } from '../../../../utils/formatWalletName';
import { capitalize } from '../../../../utils/strings';
import { SelectedAddress, useActiveChain } from '@leapwallet/cosmos-wallet-hooks';
import InputWithButton from '../../../../components/input-with-button';

type MyWalletSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  
  setSelectedAddress: (address: SelectedAddress) => void;
};

export const MyWalletSheet = ({ isOpen, onClose, setSelectedAddress }: MyWalletSheetProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const trimmedQuery = searchQuery.trim();

  const { ibcSupportData, isIbcSupportDataLoading } = {
    ibcSupportData: {},
    isIbcSupportDataLoading: false,
  };

  const {
    activeWallet: { addresses, name, colorIndex, watchWallet },
  } = useActiveWallet();
  const chainInfos = useChainInfos();
  const defaultTokenLogo = useDefaultTokenLogo();

  const activeChain = useActiveChain();

  const displayAccounts = useMemo(() => {
    if (addresses && !isIbcSupportDataLoading && ibcSupportData) {
      return Object.entries(addresses).filter(([chain]) => {
        const chainInfo = chainInfos[chain as SupportedChain];
        return chainInfo?.enabled && chain.includes(trimmedQuery);
      });
    }
    return [];
  }, [addresses, chainInfos, ibcSupportData, isIbcSupportDataLoading, trimmedQuery]);

  return (
    <BottomModal isOpen={isOpen} closeOnBackdropClick={true} title="Choose Recipient Wallet" onClose={onClose}>
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
            <InputWithButton
              icon={Images.Misc.Search}
              value={searchQuery}
              onChangeText={(e: string) => setSearchQuery(e)}
              placeholder="Search chains..."
              style={{ marginTop: 2, marginBottom: 2 }}
            />
            <View style={styles.accountListCard}>
              {displayAccounts.length > 0 ? (
                <>
                  <View style={styles.headerRow}>
                    <Text size="xs" style={styles.headerText}>
                      Other chains in current wallet: {formatWalletName(name)}
                    </Text>
                  </View>
                  <ScrollView style={{ marginTop: 8, maxHeight: 300 }}>
                    {displayAccounts.map(([_chain, address], index) => {
                      const chain = _chain as unknown as SupportedChain;
                      const img = chainInfos[chain]?.chainSymbolImageUrl ?? defaultTokenLogo;
                      const isFirst = index === 0;
                      const isLast = index === displayAccounts.length - 1;
                      return (
                        <View key={_chain}>
                          <TouchableOpacity
                            style={[
                              styles.cardContainer,
                              (isFirst || isLast) && styles.rounded,
                            ]}
                            onPress={() => {
                              setSelectedAddress({
                                address: address as string | undefined,
                                avatarIcon: Images.Misc.getWalletIconAtIndex(colorIndex, watchWallet),
                                chainIcon: img ?? '',
                                chainName: chain,
                                emoji: undefined,
                                name: `${name.length > 12 ? `${name.slice(0, 12)}...` : name} - ${capitalize(chain)}`,
                                selectionType: 'currentWallet',
                              });
                              onClose();
                            }}
                          >
                            <Image
                              source={typeof img === 'string' ? { uri: img } : img}
                              style={styles.chainImage}
                            />
                            <Text size="md" style={styles.chainName}>
                              {chain}
                            </Text>
                            <Image source={{uri: Images.Misc.RightArrow}} style={styles.arrowIcon} />
                          </TouchableOpacity>
                          {!isLast && <View style={styles.separator} />}
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
                  style={{ paddingVertical: 20, width: '100%', justifyContent: 'center' }}
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
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    height: 160,
    width: '100%',
    justifyContent: 'center',
  },
  loadingText: {
    padding: 4,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  accountListCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    marginTop: 16,
    position: 'relative',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    padding: 4,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    marginBottom: 0,
  },
  rounded: {
    borderRadius: 16,
  },
  chainImage: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 40,
    width: 40,
    backgroundColor: '#fff',
  },
  chainName: {
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'capitalize',
    marginLeft: 8,
    fontSize: 16,
  },
  arrowIcon: {
    marginLeft: 'auto',
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  separator: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    height: 1,
  },
});
