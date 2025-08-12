import React, { useMemo } from 'react';
import { View, Text as RNText, ScrollView, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Images } from '../../../../../assets/images';
import { SelectedAddress, useSelectedNetwork } from '@leapwallet/cosmos-wallet-hooks';
import { NameServiceResolveResult, nameServices, useNameServiceResolver } from '../../../../hooks/nameService/useNameService';
import { Bech32Address } from '../../../../utils/bech32';
import { useActiveChain, useGetChains } from '@leapwallet/cosmos-wallet-hooks';
import Text from '../../../../components/text';
import { Avatar } from '@leapwallet/leap-ui';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { GenericLight } from '../../../../../assets/images/logos';
import { sliceAddress } from '@leapwallet/cosmos-wallet-hooks';
import { AddressBook } from '../../../../utils/addressbook';

const NameServiceItemSkeleton = () => (
  <View style={styles.skeletonRow}>
    <View style={styles.skeletonAvatar} />
    <View style={styles.skeletonTextBlock}>
      <View style={styles.skeletonText} />
      <View style={styles.skeletonText} />
    </View>
  </View>
);

type ContactsMatchListProps = {
  contacts: AddressBook.SavedAddress[];
  
  handleContactSelect: (contact: SelectedAddress) => void;
};

export const ContactsMatchList = ({ contacts, handleContactSelect }: ContactsMatchListProps) => {
  const chainInfos = useChainInfos();

  return (
    <View style={{ marginTop: 16 }}>
      <Text size="sm" style={styles.grayText}>
        From your contacts
      </Text>
      <FlatList
        data={contacts}
        keyExtractor={(item) => item.address}
        style={{ maxHeight: 180, marginTop: 8 }}
        renderItem={({ item: contact }) => {
          const chainImage = chainInfos[contact.blockchain].chainSymbolImageUrl;
          return (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => {
                handleContactSelect({
                  avatarIcon: undefined,
                  chainIcon: chainImage ?? GenericLight,
                  chainName: chainInfos[contact.blockchain].chainName,
                  name: contact.name,
                  address: contact.address,
                  emoji: contact.emoji,
                  selectionType: 'saved',
                });
              }}
            >
              <Avatar
                chainIcon={chainImage}
                emoji={contact.emoji ?? 1}
                size="sm"
                style={styles.avatar}
              />
              <View>
                <Text size="md" style={styles.nameText}>
                  {contact.name}
                </Text>
                <Text size="sm" style={styles.addressText}>
                  {sliceAddress(contact.address)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

type NameServiceMatchListProps = {
  address: string;
  
  handleContactSelect: (contact: SelectedAddress) => void;
};

export const NameServiceMatchList = ({ address, handleContactSelect }: NameServiceMatchListProps) => {
  const network = useSelectedNetwork();
  const chainInfos = useChainInfos();
  const activeChain = useActiveChain();
  const chains = useGetChains();

  const [isLoading, nameServiceResults] = useNameServiceResolver(address, network);

  const resultsList: [string, NameServiceResolveResult | null][] = useMemo(() => {
    const entries = Object.entries(nameServiceResults);
    return entries.filter(([, result]) => result !== null);
  }, [nameServiceResults]);

  let anyResultsForCurrentChain = false;

  return (
    <View style={{ marginTop: 16 }}>
      <Text size="sm" style={styles.grayText}>
        Available addresses for "{address}"
      </Text>
      {!isLoading ? (
        <>
          {resultsList && resultsList.length > 0 ? (
            <ScrollView style={{ maxHeight: 180, marginTop: 8 }} showsVerticalScrollIndicator={false}>
              {resultsList.map(([nameService, result]) => {
                const nameServiceImg = Images.Logos.getNameServiceLogo(nameService);
                if (result && typeof result === 'string') {
                  const chain = Bech32Address.getChainKey(result);
                  return (
                    <MatchListItem
                      key={`${nameService}-${result}`}
                      title={nameService}
                      address={result}
                      nameServiceImg={nameServiceImg}
                      chainIcon={chain ? chainInfos[chain].chainSymbolImageUrl ?? GenericLight : GenericLight}
                      handleClick={() => {
                        handleContactSelect({
                          avatarIcon: nameServiceImg,
                          chainIcon: chain ? chainInfos[chain].chainSymbolImageUrl ?? GenericLight : GenericLight,
                          chainName: chain ? chainInfos[chain].chainName : 'Chain',
                          name: address,
                          address: result,
                          emoji: undefined,
                          selectionType: 'nameService',
                          information: {
                            nameService: nameServices[nameService],
                            chain_id: chain ? chainInfos[chain].chainName : null,
                          },
                        });
                      }}
                    />
                  );
                }

                if (result && Array.isArray(result)) {
                  const filteredItems = result
                    .map(({ chain_id, address: resolvedAddress }) => {
                      const chainDetails = Object.values(chainInfos).find((chain) => chain.chainId === chain_id);
                      const chainImage = chainDetails?.chainSymbolImageUrl ?? GenericLight;

                      let shouldShow = true;
                      if (activeChain as string !== 'aggregated') {
                        if (chains[activeChain]?.evmOnlyChain) {
                          if (chainDetails?.key !== activeChain) shouldShow = false;
                        } else {
                          if (resolvedAddress.startsWith('0x')) shouldShow = false;
                        }
                      }

                      if (shouldShow) {
                        anyResultsForCurrentChain = true;
                        return (
                          <MatchListItem
                            title={chainDetails?.chainName ?? nameService}
                            key={`${nameService}-${chain_id}-${resolvedAddress}`}
                            address={resolvedAddress}
                            nameServiceImg={nameServiceImg}
                            chainIcon={chainImage}
                            handleClick={() => {
                              handleContactSelect({
                                avatarIcon: nameServiceImg,
                                chainIcon: chainImage,
                                chainName: chainDetails?.chainName ?? 'Chain',
                                name: address,
                                address: resolvedAddress,
                                emoji: undefined,
                                selectionType: 'nameService',
                                information: {
                                  nameService: nameServices[nameService],
                                  chain_id,
                                },
                              });
                            }}
                          />
                        );
                      }
                      return null;
                    })
                    .filter(Boolean);

                  return filteredItems.length > 0 ? filteredItems : null;
                }
                return null;
              })}
              {!anyResultsForCurrentChain && activeChain as string !== 'aggregated' && (
                <RNText style={styles.noResultText}>
                  No results found for {chains[activeChain]?.chainName || activeChain}
                </RNText>
              )}
            </ScrollView>
          ) : (
            <RNText style={styles.noResultText}>No results found in any name service</RNText>
          )}
        </>
      ) : (
        <View style={{ marginTop: 8 }}>
          <NameServiceItemSkeleton />
          <NameServiceItemSkeleton />
          <NameServiceItemSkeleton />
        </View>
      )}
    </View>
  );
};

const MatchListItem = ({ address, title, nameServiceImg, chainIcon, handleClick }:{
  address: string;
  title: string;
  nameServiceImg: string;
  chainIcon?: string;
  handleClick: () => void;
}) => (
  <TouchableOpacity style={styles.listItem} onPress={handleClick}>
    <Avatar
      size="sm"
      avatarImage={nameServiceImg}
      chainIcon={chainIcon}
      style={styles.avatar}
    />
    <View>
      <Text size="md" style={styles.nameText}>
        {title}
      </Text>
      <Text size="sm" style={styles.addressText}>
        {sliceAddress(address)}
      </Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  grayText: {
    color: '#6b7280', // Tailwind gray-600
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    marginLeft: 0,
  },
  avatar: {
    marginRight: 8,
    borderRadius: 100,
    backgroundColor: '#e5e7eb', // light gray, or adjust for dark mode
    height: 40,
    width: 40,
  },
  nameText: {
    color: '#1f2937', // Tailwind gray-800
  },
  addressText: {
    color: '#6b7280', // Tailwind gray-600
  },
  noResultText: {
    color: '#fca5a5',
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 8,
  },
  // Skeleton styles (basic RN placeholder)
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
  },
  skeletonTextBlock: {
    marginLeft: 12,
    width: 200,
  },
  skeletonText: {
    height: 10,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
    width: '90%',
  },
});
