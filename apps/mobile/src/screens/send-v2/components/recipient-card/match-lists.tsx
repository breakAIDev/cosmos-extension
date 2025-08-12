import React, { useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SelectedAddress, sliceAddress, useActiveChain, useGetChains, useSelectedNetwork } from '@leapwallet/cosmos-wallet-hooks';
import { Avatar } from '@leapwallet/leap-ui';
import Text from '../../../../components/text';
import { NameServiceResolveResult, nameServices, useNameServiceResolver } from '../../../../hooks/nameService/useNameService';
import { useChainInfos } from '../../../../hooks/useChainInfos';
import { Images } from '../../../../../assets/images';
import { GenericLight } from '../../../../../assets/images/logos';
import { AggregatedSupportedChain } from '../../../../types/utility';
import { AddressBook } from '../../../../utils/addressbook';
import { Bech32Address } from '../../../../utils/bech32';

// Skeleton Placeholder (replace with a better skeleton if you have one)
const NameServiceItemSkeleton = () => (
  <View style={styles.skeletonRow}>
    <View style={styles.skeletonAvatar} />
    <View style={styles.skeletonTextBlock}>
      <View style={styles.skeletonLine} />
      <View style={[styles.skeletonLine, { width: 100, marginTop: 8 }]} />
    </View>
  </View>
);

type ContactsMatchListProps = {
  contacts: AddressBook.SavedAddress[];
  handleContactSelect: (contact: SelectedAddress) => void;
};

export const ContactsMatchList: React.FC<ContactsMatchListProps> = ({ contacts, handleContactSelect }) => {
  const chainInfos = useChainInfos();

  return (
    <View style={{ marginTop: 16 }}>
      <Text size="sm" style={{ color: '#6B7280' }}>From your contacts</Text>
      <ScrollView style={{ maxHeight: 180 }} contentContainerStyle={{ paddingVertical: 8 }}>
        {contacts.map((contact) => {
          const chainImage = chainInfos[contact.blockchain]?.chainSymbolImageUrl;

          return (
            <TouchableOpacity
              key={contact.address}
              style={styles.matchRow}
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
              activeOpacity={0.7}
            >
              <Avatar
                chainIcon={chainImage}
                emoji={contact.emoji ?? 1}
                size="sm"
                style={styles.avatar}
              />
              <View>
                <Text size="md" style={styles.contactTitle}>
                  {contact.name}
                </Text>
                <Text size="sm" style={styles.contactSub}>
                  {sliceAddress(contact.address)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

type NameServiceMatchListProps = {
  address: string;
  handleContactSelect: (contact: SelectedAddress) => void;
};

export const NameServiceMatchList: React.FC<NameServiceMatchListProps> = ({ address, handleContactSelect }) => {
  const network = useSelectedNetwork();
  const chainInfos = useChainInfos();
  const activeChain = useActiveChain() as AggregatedSupportedChain;
  const chains = useGetChains();
  const [isLoading, nameServiceResults] = useNameServiceResolver(address, network);

  const resultsList: [string, NameServiceResolveResult | null][] = useMemo(() => {
    const entries = Object.entries(nameServiceResults);
    return entries.filter(([, result]) => result !== null);
  }, [nameServiceResults]);

  let anyResultsForCurrentChain = false;

  return (
    <View style={{ marginTop: 16 }}>
      <Text size="sm" style={{ color: '#6B7280' }}>
        Available addresses for "{address}"
      </Text>
      {!isLoading ? (
        <>
          {resultsList && resultsList.length > 0 ? (
            <ScrollView style={{ maxHeight: 180 }} contentContainerStyle={{ paddingVertical: 8 }}>
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
                      const chain = Bech32Address.getChainKey(resolvedAddress);
                      const chainDetails = Object.values(chainInfos).find((chain) => chain.chainId === chain_id);
                      const chainImage = chainDetails?.chainSymbolImageUrl ?? GenericLight;

                      let shouldShow = true;
                      if (activeChain !== 'aggregated') {
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

                  return filteredItems.length > 0 ? <View key={nameService}>{filteredItems}</View> : null;
                }
                return null;
              })}
              {!anyResultsForCurrentChain && activeChain !== 'aggregated' && (
                <Text size="sm" style={styles.noResultsRed}>
                  No results found for {chains[activeChain]?.chainName || activeChain}
                </Text>
              )}
            </ScrollView>
          ) : (
            <Text size="sm" style={styles.noResultsRed}>
              No results found in any name service
            </Text>
          )}
        </>
      ) : (
        <View style={{ paddingVertical: 12 }}>
          <NameServiceItemSkeleton />
          <NameServiceItemSkeleton />
          <NameServiceItemSkeleton />
        </View>
      )}
    </View>
  );
};

const MatchListItem: React.FC<{
  address: string;
  title: string;
  nameServiceImg: string;
  chainIcon?: string;
  handleClick: () => void;
}> = ({ address, title, nameServiceImg, chainIcon, handleClick }) => (
  <TouchableOpacity style={styles.matchRow} onPress={handleClick} activeOpacity={0.7}>
    <Avatar
      size="sm"
      avatarImage={nameServiceImg}
      chainIcon={chainIcon}
      style={styles.avatar}
    />
    <View>
      <Text size="md" style={styles.contactTitle}>{title}</Text>
      <Text size="sm" style={styles.contactSub}>{sliceAddress(address)}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  avatar: {
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    height: 40,
    width: 40,
  },
  contactTitle: {
    color: '#1F2937',
    fontWeight: 'bold',
  },
  contactSub: {
    color: '#6B7280',
  },
  noResultsRed: {
    color: '#F87171',
    fontWeight: 'bold',
    marginTop: 8,
    fontSize: 14,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  skeletonTextBlock: {
    marginLeft: 8,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  skeletonLine: {
    height: 12,
    width: 140,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
});

