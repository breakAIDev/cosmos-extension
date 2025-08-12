import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, StyleSheet, ScrollView } from 'react-native';
import { observer } from 'mobx-react-lite';
import { ChainTagsStore } from '@leapwallet/cosmos-wallet-store';
import { useActiveChain } from '../../../hooks/settings/useActiveChain';
import { useChainInfos } from '../../../hooks/useChainInfos';
import { useDontShowSelectChain } from '../../../hooks/useDontShowSelectChain';
import { useGetWalletAddresses } from '../../../hooks/useGetWalletAddresses';
import { useDefaultTokenLogo } from '../../../hooks/utility/useDefaultTokenLogo';
import { InputComponent } from '../../../components/input-component/InputComponent';
import { LoaderAnimation } from '../../../components/loader/Loader';
import BottomModal from '../../../components/bottom-modal';
import Text from '../../../components/text';
import { Images } from '../../../../assets/images';
import { getChainName } from '../../../utils/getChainName';
import { normalizeImageSrc } from '../../../utils/normalizeImageSrc';
import { NftToggleCard, NftAvatar, Text as NftText, ManageCollectionsProps } from './index';
import { AggregatedSupportedChain } from '../../../types/utility';
import { AGGREGATED_CHAIN_KEY } from '../../../services/config/constants';
import { getNftBalanceCount, getNftContractInfo, getNftTokenIdInfo, SupportedChain } from '@leapwallet/cosmos-wallet-sdk';
import { betaEvmNftTokenIdsStore, betaNftChainsStore, betaNftsCollectionsStore, nftChainsStore, nftStore } from '../../../context/nft-store';
import { BETA_EVM_NFT_TOKEN_IDS, BETA_NFT_CHAINS, BETA_NFTS_COLLECTIONS, CosmWasmClientHandler, NftChain, StoredBetaNftCollection, useChainApis, useDisabledNFTsCollections, useSetDisabledNFTsInStorage } from '@leapwallet/cosmos-wallet-hooks';
import { manageChainsStore } from '../../../context/manage-chains-store';
import { SelectChainSheet } from '../../swaps-v2/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GenericCard } from '@leapwallet/leap-ui';

type AddCollectionProps = Omit<ManageCollectionsProps, 'openAddCollectionSheet'> & {
  chainTagsStore: ChainTagsStore;
};

export const AddCollection = observer(({ isVisible, onClose, chainTagsStore }: AddCollectionProps) => {
  const chainInfos = useChainInfos();
  let activeChain = useActiveChain();

  if ((activeChain as AggregatedSupportedChain) === AGGREGATED_CHAIN_KEY) {
    activeChain = 'cosmos';
  }

  const defaultTokenLogo = useDefaultTokenLogo();
  const timeoutIdRef = useRef<NodeJS.Timeout>();

  const [showSelectChain, setShowSelectChain] = useState(false);
  const [enteredCollection, setEnteredCollection] = useState<string>('');
  const [enteredTokenId, setEnteredTokenId] = useState('');
  const [selectedChain, setSelectedChain] = useState<SupportedChain>('' as SupportedChain);

  const [nftInfo, setNftInfo] = useState<{ [key: string]: any }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fetchingCollectionInfo, setFetchingCollectionInfo] = useState(false);

  const nftChains = [...nftChainsStore.nftChains, ...betaNftChainsStore.betaNftChains];
  const disabledNFTsCollections = useDisabledNFTsCollections();
  const setDisabledNFTsCollections = useSetDisabledNFTsInStorage();

  const chain = useMemo(() => (selectedChain ? selectedChain : activeChain), [activeChain, selectedChain]);
  const forceNetwork = useMemo(() => {
    if (activeChain === 'seiDevnet') {
      return 'mainnet';
    }
    return chainInfos[chain].chainId === chainInfos[chain].testnetChainId ? 'testnet' : 'mainnet';
  }, [activeChain, chain, chainInfos]);

  const walletAddresses = useGetWalletAddresses(selectedChain);
  const { rpcUrl, evmJsonRpc } = useChainApis(chain, forceNetwork);

  const dontShowSelectChain = useDontShowSelectChain(manageChainsStore);
  const showTokenIdInput = useMemo(() => {
    return enteredCollection.length > 0 && enteredCollection.toLowerCase().startsWith('0x');
  }, [enteredCollection]);

  useEffect(() => {
    setSelectedChain('' as SupportedChain);
  }, [activeChain]);

  useEffect(() => {
    let isCancelled = false;

    if (
      enteredCollection.length !== 0 &&
      (showTokenIdInput ? enteredTokenId.length !== 0 : true) &&
      rpcUrl &&
      selectedChain
    ) {
      clearTimeout(timeoutIdRef.current);

      timeoutIdRef.current = setTimeout(async () => {
        try {
          setErrors({});
          setNftInfo({});
          setFetchingCollectionInfo(true);
          let tokens = [];
          let contractInfo = { name: '' };

          if (
            chainInfos[selectedChain]?.evmOnlyChain &&
            enteredCollection.toLowerCase().startsWith('0x') &&
            evmJsonRpc
          ) {
            const address = walletAddresses[0].toLowerCase().startsWith('0x') ? walletAddresses[0] : walletAddresses[1];

            const [_contractInfo, balanceCount, tokenIdInfo] = await Promise.all([
              getNftContractInfo(enteredCollection, evmJsonRpc),
              getNftBalanceCount(enteredCollection, address, evmJsonRpc),
              getNftTokenIdInfo(enteredCollection, enteredTokenId, address, evmJsonRpc),
            ]);

            if (isCancelled) return;
            const tempContractInfo: { name: string; image?: string } = _contractInfo;

            try {
              const res = await fetch(normalizeImageSrc(tokenIdInfo.tokenURI, enteredCollection));
              const nftDisplayInfo = await JSON.parse((await res.text()).trim());

              if (isCancelled) return;
              if (nftDisplayInfo.image) {
                tempContractInfo.image = nftDisplayInfo.image;
              }
            } catch (e) {
              if (tokenIdInfo.tokenURI) {
                tempContractInfo.image = tokenIdInfo.tokenURI;
              } else {
                setErrors((prevValue) => ({
                  ...prevValue,
                  tokenId: "Not able to fetch NFT's image.",
                }));

                return;
              }
            }

            contractInfo = _contractInfo;
            Number(balanceCount) && (tokens = [balanceCount]);
          } else {
            const client = await CosmWasmClientHandler.getClient(rpcUrl);
            const address = walletAddresses[0].toLowerCase().startsWith('0x') ? walletAddresses[1] : walletAddresses[0];

            if (isCancelled) return;
            const [tokenInfo, _contractInfo] = await Promise.all([
              client.queryContractSmart(enteredCollection, {
                tokens: { owner: address, limit: 2 },
              }),
              client.queryContractSmart(enteredCollection, {
                contract_info: {},
              }),
            ]);

            if (isCancelled) return;
            contractInfo = _contractInfo;
            tokens = tokenInfo?.tokens ?? tokenInfo?.ids ?? [];
          }

          if (tokens.length === 0) {
            setErrors((prevValue) => ({
              ...prevValue,
              noTokens: "Couldn't enable collection. You don't have any NFT in this collection.",
            }));
          }

          setNftInfo({ contractInfo, enable: false });
        } catch (error) {
          if (isCancelled) return;

          if ((error as Error).message.toLowerCase().includes('token does not belong')) {
            setErrors((prevValue) => ({
              ...prevValue,
              tokenId: (error as Error).message,
            }));
          } else {
            setErrors((prevValue) => ({
              ...prevValue,
              collection: 'Invalid collection address.',
            }));
          }
        } finally {
          setFetchingCollectionInfo(false);
        }
      }, 200);
    }

    return () => {
      isCancelled = true;
    };
  }, [
    enteredCollection,
    walletAddresses,
    rpcUrl,
    selectedChain,
    evmJsonRpc,
    showTokenIdInput,
    enteredTokenId,
    chainInfos,
  ]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setEnteredCollection(value);

    if (value && selectedChain as string === '') {
      setErrors({ selectedChain: 'Please select a chain' });
    } else {
      setErrors({});
    }
  };

  const handleTokenIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.trim();
    setErrors({});
    setEnteredTokenId(value);
  };

  const updateBetaEvmNftTokenIds = async () => {
    const storage = await AsyncStorage.getItem(BETA_EVM_NFT_TOKEN_IDS);
    const address = walletAddresses[0].toLowerCase().startsWith('0x') ? walletAddresses[0] : walletAddresses[1];

    if (storage) {
      const betaEvmNftTokenIds = JSON.parse(storage ?? '{}');
      const newStorageInfo = {
        ...betaEvmNftTokenIds,
        [enteredCollection]: {
          ...(betaEvmNftTokenIds[enteredCollection] ?? {}),
          [address]: [...(betaEvmNftTokenIds[enteredCollection]?.[address] ?? []), enteredTokenId],
        },
      };

      await betaEvmNftTokenIdsStore.setBetaEvmNftTokenIds(newStorageInfo);
    } else {
      const newStorageInfo = {
        [enteredCollection]: {
          [address]: [enteredTokenId],
        },
      };

      await betaEvmNftTokenIdsStore.setBetaEvmNftTokenIds(newStorageInfo);
    }
  };

  const handleToggleClick = async (isEnabled: boolean) => {
    setNftInfo((prevValue) => ({ ...prevValue, enable: isEnabled }));

    let _disabledNFTsCollections: string[] = [];

    let hasToSetInfo = true;
    let hasToSetEvmTokenIds = true;

    const collectionsStr = await AsyncStorage.getItem(BETA_NFTS_COLLECTIONS);
    const chainsStr = await AsyncStorage.getItem(BETA_NFT_CHAINS);
    const tokenIdsStr = await AsyncStorage.getItem(BETA_EVM_NFT_TOKEN_IDS);

    if (isEnabled) {
      _disabledNFTsCollections = disabledNFTsCollections.filter((collection) => collection !== enteredCollection);

      if (collectionsStr) {
        const parsedData: StoredBetaNftCollection[] =
          JSON.parse(collectionsStr)?.[selectedChain]?.[forceNetwork] ?? [];

        if (parsedData.some((collection) => collection.address === enteredCollection)) {
          if (enteredCollection.toLowerCase().startsWith('0x')) {
            const betaEvmNftTokenIds = JSON.parse(tokenIdsStr ?? '{}');
            const address = walletAddresses[0].toLowerCase().startsWith('0x') ? walletAddresses[0] : walletAddresses[1];

            if (betaEvmNftTokenIds?.[enteredCollection]?.[address]?.includes(enteredTokenId)) {
              hasToSetInfo = false;
              hasToSetEvmTokenIds = false;
            }
          } else {
            hasToSetInfo = false;
          }
        }
      }
    } else {
      if (!_disabledNFTsCollections.includes(enteredCollection)) {
        _disabledNFTsCollections = [...disabledNFTsCollections, enteredCollection];
      }
    }

    await setDisabledNFTsCollections(_disabledNFTsCollections);

    if (hasToSetInfo) {
      const newCollection = {
        address: enteredCollection,
        name: nftInfo?.contractInfo?.name ?? 'Unknown',
        image: nftInfo?.contractInfo?.image ?? '',
      };

      if (collectionsStr) {
        const parsedData = JSON.parse(collectionsStr);

        if (
          !parsedData?.[selectedChain]?.[forceNetwork]?.some(
            (collection: StoredBetaNftCollection) => collection.address === enteredCollection,
          )
        ) {
          const newStorageInfo = {
            ...parsedData,
            [selectedChain]: {
              ...(parsedData[selectedChain] ?? {}),
              [forceNetwork]: [...(parsedData[selectedChain]?.[forceNetwork] ?? []), newCollection],
            },
          };

          await betaNftsCollectionsStore.setBetaNftsCollections(newStorageInfo);
        }
      } else {
        const newStorageInfo = {
          [selectedChain]: {
            [forceNetwork]: [newCollection],
          },
        };

        await betaNftsCollectionsStore.setBetaNftsCollections(newStorageInfo);
      }

      if (enteredCollection.toLowerCase().startsWith('0x') && hasToSetEvmTokenIds) {
        await updateBetaEvmNftTokenIds();
      }

      const isANewChain = nftChains.every((nftChain) => nftChain.forceContractsListChain !== selectedChain);

      if (isANewChain) {
        const chain: NftChain = {
          forceNetwork,
          forceChain: selectedChain,
          forceContractsListChain: selectedChain,
        };

        await betaNftChainsStore.setBetaNftChains([...JSON.parse(chainsStr ?? '[]'), chain]);
      }

      nftStore.loadNfts();
    }
  };

  return (
    <>
      <BottomModal
        isOpen={isVisible}
        onClose={() => {
          onClose();
          setSelectedChain('');
          setEnteredCollection('');
          setNftInfo({});
          setErrors({});
        }}
        title={'Add Collection'}
        closeOnBackdropClick={true}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.chainRow}>
            <GenericCard
              title={selectedChain ? getChainName(chainInfos[selectedChain].chainName) : 'Select Chain'}
              img={
                <Image
                  source={
                    selectedChain
                      ? {uri: chainInfos[selectedChain].chainSymbolImageUrl ?? defaultTokenLogo}
                      : {uri: defaultTokenLogo}
                  }
                  style={styles.chainIcon}
                />
              }
              isRounded={true}
              title2={selectedChain ? 'Chain' : ''}
              icon={
                dontShowSelectChain ? undefined : (
                  <Image source={{uri: Images.Misc.RightArrow}} style={styles.rightArrow} />
                )
              }
              style={dontShowSelectChain && styles.cursorDefault}
              onPress={dontShowSelectChain ? undefined : () => setShowSelectChain(true)}
            />
          </View>
          {errors?.selectedChain && enteredCollection.length > 0 && (
            <Text size="sm" style={styles.errorText}>
              {errors?.selectedChain}
            </Text>
          )}

          <View style={styles.inputCard}>
            <InputComponent
              placeholder="Enter collection address"
              value={enteredCollection}
              name="collection"
              onChange={(e: string) => setEnteredTokenId(e)}
              error={errors.collection}
            />
          </View>

          {showTokenIdInput ? (
            <InputComponent
              placeholder="Enter token id"
              name="tokenId"
              value={enteredTokenId}
              onChange={(e: string) => setEnteredTokenId(e)}
              error={errors.tokenId}
            />
          ) : null}

          {fetchingCollectionInfo && (
            <View style={styles.loaderRow}>
              <LoaderAnimation color="#29a874" />
            </View>
          )}

          {Object.keys(nftInfo).length > 0 && (
            <NftToggleCard
              title={
                <NftText style={styles.nftTitle}>
                  {nftInfo.contractInfo?.name ?? ''}
                </NftText>
              }
              size="md"
              avatar={<NftAvatar image={normalizeImageSrc(nftInfo.contractInfo?.image ?? '', enteredCollection)} />}
              isEnabled={nftInfo.enable}
              isRounded={true}
              onPress={errors.noTokens ? () => undefined : (isEnabled) => handleToggleClick(isEnabled)}
              style={styles.toggleCard}
            />
          )}

          {errors.noTokens && (
            <Text size="sm" style={styles.errorText}>
              Couldn't enable collection. You don't have any NFT in this collection.
            </Text>
          )}
        </ScrollView>
      </BottomModal>

      <SelectChainSheet
        onPage="AddCollection"
        isVisible={showSelectChain}
        onClose={() => setShowSelectChain(false)}
        selectedChain={selectedChain}
        onChainSelect={(chaiName) => {
          setSelectedChain(chaiName);
          setShowSelectChain(false);
        }}
        chainTagsStore={chainTagsStore}
      />
    </>
  );
});

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
    paddingTop: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    minHeight: 180,
  },
  chainRow: {
    marginBottom: 8,
  },
  chainIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cccccc',
    backgroundColor: '#fff',
  },
  rightArrow: {
    width: 10,
    height: 10,
    marginLeft: 8,
  },
  cursorDefault: {
    // Optionally disable pointer events or change opacity
    opacity: 0.7,
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    marginTop: 10,
  },
  loaderRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  nftTitle: {
    maxWidth: 95,
  },
  toggleCard: {
    borderRadius: 16,
    marginTop: 12,
    marginBottom: 10,
  },
  errorText: {
    color: '#fca5a5',
    marginTop: 10,
    marginBottom: 10,
    fontWeight: 'bold',
  },
});
